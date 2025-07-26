#!/usr/bin/env python3

import csv
import requests
import time
from collections import OrderedDict

def validate_url(url, timeout=10):
    """Check if a URL is accessible"""
    try:
        response = requests.get(url, timeout=timeout, allow_redirects=True)
        if response.status_code == 200:
            return True, "Working", response.status_code
        else:
            return False, f"HTTP {response.status_code}", response.status_code
    except requests.exceptions.Timeout:
        return False, "Timeout", None
    except requests.exceptions.ConnectionError:
        return False, "Connection Error", None
    except requests.exceptions.RequestException as e:
        return False, f"Request Error: {str(e)}", None

def read_csv_data(filename):
    """Read professor data from CSV file"""
    professors = []
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                professors.append({
                    'name': row['name'].strip(),
                    'field_of_research': row['field_of_research'].strip(),
                    'university_name': row['university_name'].strip(),
                    'email': row['email'].strip(),
                    'official_url': row['official_url'].strip()
                })
    except FileNotFoundError:
        print(f"File {filename} not found")
        return []
    return professors

def consolidate_professors():
    """Merge existing professors with web-sourced professors"""
    print("📚 Reading existing professor data...")
    existing_professors = read_csv_data('data/professors.csv')
    print(f"Found {len(existing_professors)} existing professors")
    
    print("🌐 Reading web-sourced professor data...")
    web_professors = read_csv_data('web_professors_found.csv')
    print(f"Found {len(web_professors)} new web-sourced professors")
    
    # Combine and deduplicate by email
    print("🔄 Consolidating and deduplicating...")
    unique_professors = OrderedDict()
    
    # Add existing professors first
    for prof in existing_professors:
        email = prof['email'].strip().lower()
        if email not in unique_professors:
            unique_professors[email] = prof
    
    # Add web professors (skip duplicates)
    new_additions = 0
    for prof in web_professors:
        email = prof['email'].strip().lower()
        if email not in unique_professors:
            unique_professors[email] = prof
            new_additions += 1
    
    final_professors = list(unique_professors.values())
    print(f"✅ Total unique professors: {len(final_professors)}")
    print(f"🆕 New professors added: {new_additions}")
    
    return final_professors

def validate_all_urls(professors):
    """Validate all professor URLs and categorize results"""
    print("🔍 Validating all professor URLs...")
    working_urls = []
    broken_urls = []
    
    for i, prof in enumerate(professors, 1):
        print(f"Checking {i}/{len(professors)}: {prof['name']}")
        
        is_working, error_msg, status_code = validate_url(prof['official_url'])
        
        if is_working:
            working_urls.append(prof)
        else:
            broken_entry = prof.copy()
            broken_entry['error'] = error_msg
            broken_entry['status_code'] = status_code or 'N/A'
            broken_urls.append(broken_entry)
        
        # Small delay to be respectful
        time.sleep(0.5)
    
    return working_urls, broken_urls

def save_results(all_professors, working_professors, broken_urls):
    """Save all results to files"""
    
    # Save consolidated list
    print("💾 Saving consolidated professor list...")
    with open('consolidated_professors_with_web.csv', 'w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=['name', 'field_of_research', 'university_name', 'email', 'official_url'])
        writer.writeheader()
        writer.writerows(all_professors)
    
    # Save working professors
    print("💾 Saving professors with working URLs...")
    with open('professors_working_urls.csv', 'w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=['name', 'field_of_research', 'university_name', 'email', 'official_url'])
        writer.writeheader()
        writer.writerows(working_professors)
    
    # Save broken URLs
    if broken_urls:
        print("💾 Saving broken URLs report...")
        with open('web_broken_urls.csv', 'w', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=['name', 'university_name', 'email', 'field_of_research', 'url', 'error', 'status_code'])
            writer.writeheader()
            for prof in broken_urls:
                writer.writerow({
                    'name': prof['name'],
                    'university_name': prof['university_name'],
                    'email': prof['email'],
                    'field_of_research': prof['field_of_research'],
                    'url': prof['official_url'],
                    'error': prof['error'],
                    'status_code': prof['status_code']
                })
    
    # Update main database with working professors
    print("💾 Updating main database...")
    with open('data/professors.csv', 'w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=['name', 'field_of_research', 'university_name', 'email', 'official_url'])
        writer.writeheader()
        writer.writerows(working_professors)

def main():
    print("🚀 Starting web professor consolidation...")
    
    # Step 1: Consolidate data
    all_professors = consolidate_professors()
    
    # Step 2: Validate URLs
    working_professors, broken_urls = validate_all_urls(all_professors)
    
    # Step 3: Save results
    save_results(all_professors, working_professors, broken_urls)
    
    # Step 4: Report results
    print("\n" + "="*60)
    print("📊 CONSOLIDATION COMPLETE!")
    print("="*60)
    print(f"📚 Total professors found: {len(all_professors)}")
    print(f"✅ Professors with working URLs: {len(working_professors)}")
    print(f"❌ Professors with broken URLs: {len(broken_urls)}")
    print(f"📈 Success rate: {len(working_professors)/len(all_professors)*100:.1f}%")
    
    # University breakdown
    university_counts = {}
    for prof in working_professors:
        uni = prof['university_name']
        university_counts[uni] = university_counts.get(uni, 0) + 1
    
    print(f"\n🏫 UNIVERSITY BREAKDOWN:")
    for uni, count in sorted(university_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"   {uni}: {count} professors")

if __name__ == "__main__":
    main() 