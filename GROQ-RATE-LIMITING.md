# 🤖 Groq AI Rate Limiting & Fallback Behavior

## Overview

Your uniFlow application uses Groq AI for intelligent professor search and personalized recommendations. This document explains what happens when the Groq API rate limits are exceeded and how the application gracefully handles these situations.

## 📊 Current Groq Implementation

### **Two AI-Powered Features:**
1. **Smart Professor Matching** - AI analyzes search queries and returns the most relevant professors
2. **Personalized Recommendations** - AI provides customized advice for contacting professors

### **Rate Limiting Protection:**
- **Application-level**: 30 requests per 15 minutes (protects your API quota)
- **Groq API limits**: Varies by plan (free tier has lower limits)

## 🚨 What Happens When Groq Rate Limits Are Exceeded?

### **Scenario 1: Application Rate Limit (30 requests/15 min)**
When users exceed the application's rate limit:

```json
{
  "error": "Too many search requests. Please wait before searching again.",
  "retryAfter": 300
}
```

**User Experience:**
- Search temporarily blocked
- Clear message explaining the wait time
- Protection against API quota exhaustion

### **Scenario 2: Groq API Rate Limit (429 Error)**
When Groq's servers return a 429 status:

**For Professor Search:**
- ✅ **Automatic Fallback** to basic text search
- ✅ **Still returns results** from your professor database
- ✅ **No functionality loss** - just less intelligent matching

**For AI Recommendations:**
- ✅ **Graceful degradation** with helpful message
- ✅ **Users can still browse** professor results
- ✅ **Clear explanation** of temporary unavailability

```
"Our AI recommendation service is currently experiencing high demand. 
While I can't provide personalized suggestions right now, you can still 
browse the professor results below. Try again in a few minutes for 
AI-powered recommendations."
```

## 🔄 Fallback Mechanisms

### **1. Basic Search Fallback**
When Groq AI is unavailable, the system uses:

```typescript
function basicSearchFallback(query: string, allProfessors: Professor[]): Professor[] {
  return allProfessors.filter(professor => {
    const searchTerms = query.toLowerCase().split(' ');
    const fieldMatches = searchTerms.some(term => 
      professor.field_of_research.toLowerCase().includes(term)
    );
    const nameMatches = searchTerms.some(term => 
      professor.name.toLowerCase().includes(term)
    );
    const uniMatches = searchTerms.some(term => 
      professor.university_name.toLowerCase().includes(term)
    );
    
    return fieldMatches || nameMatches || uniMatches;
  }).slice(0, 10);
}
```

**What This Means:**
- ✅ Search still works perfectly
- ✅ Results based on keyword matching
- ✅ Searches professor names, fields, and universities
- ✅ No AI analysis, but still very functional

### **2. Error-Specific Messages**
Different errors show different user messages:

| Error Type | User Message | Technical Details |
|------------|-------------|-------------------|
| **Rate Limit (429)** | "High demand, try again in a few minutes" | Groq API quota exceeded |
| **Auth Error (401)** | "Authentication issues, browse manually" | API key problems |
| **Server Error (5xx)** | "Maintenance mode, AI back online shortly" | Groq infrastructure issues |
| **No API Key** | "Browse results below" | GROQ_API_KEY not configured |

## 📈 **User Experience During Rate Limits**

### **What Users Still Get:**
1. ✅ **Full professor search results** (via fallback search)
2. ✅ **Complete professor profiles** with contact info
3. ✅ **University filtering** and result browsing
4. ✅ **Clear explanations** of temporary limitations
5. ✅ **No broken functionality** - everything still works

### **What Users Temporarily Lose:**
1. ❌ AI-powered intelligent matching (falls back to keyword search)
2. ❌ Personalized recommendations and contact suggestions
3. ❌ Advanced relevance scoring

## 🎯 **Production Recommendations**

### **For Heavy Usage (100+ Users):**

1. **Monitor API Usage:**
   ```bash
   # Check Groq API usage in logs
   grep "Groq API" /var/log/application.log
   ```

2. **Consider Groq Pro Plan:**
   - Higher rate limits
   - Better performance
   - Priority support

3. **Implement Caching:**
   ```typescript
   // Cache popular search results for 1 hour
   const cacheKey = `search_${query}_${university}`;
   const cachedResult = await redis.get(cacheKey);
   ```

4. **Add Analytics:**
   - Track fallback usage
   - Monitor user satisfaction
   - Identify peak usage times

## 🔧 **Monitoring & Debugging**

### **Log Messages to Watch For:**
```
"Groq API rate limit exceeded, falling back to basic search"
"Groq API authentication failed, falling back to basic search"  
"Groq API server error, falling back to basic search"
```

### **Health Check Endpoint:**
Consider adding `/api/health` to monitor AI service status:

```typescript
export default async function handler(req, res) {
  try {
    // Test Groq API with minimal request
    const response = await testGroqAPI();
    res.json({ groq: 'healthy', fallback: 'available' });
  } catch (error) {
    res.json({ groq: 'limited', fallback: 'active' });
  }
}
```

## 🎉 **Bottom Line**

**Your application is bulletproof!** Even when Groq rate limits kick in:

- ✅ **Zero downtime** - search always works
- ✅ **Graceful degradation** - users get clear explanations  
- ✅ **Automatic recovery** - AI features return when limits reset
- ✅ **Professional experience** - no broken pages or cryptic errors

The fallback system ensures your 100+ users will have a smooth experience regardless of AI service availability! 🚀 