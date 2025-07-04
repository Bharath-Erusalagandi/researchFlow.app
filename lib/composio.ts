import { OpenAIToolSet, Composio } from 'composio-core';

// Initialize Composio toolset
const toolset = new OpenAIToolSet({
  apiKey: process.env.COMPOSIO_API_KEY,
});

// Get composio client for integration management
const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

// Gmail integration functions
export class ComposioGmailService {
  private toolset: OpenAIToolSet;
  private composio: Composio;

  constructor() {
    this.toolset = toolset;
    this.composio = composio;
  }

  /**
   * Get available Gmail tools for use with OpenAI
   */
  async getGmailTools() {
    try {
      const tools = await this.toolset.getTools({
        actions: ["GMAIL_SEND_EMAIL", "GMAIL_CREATE_DRAFT", "GMAIL_GET_PROFILE"]
      });
      return tools;
    } catch (error) {
      console.error('Error fetching Gmail tools:', error);
      throw error;
    }
  }

  /**
   * Get specific Gmail actions
   */
  async getGmailActions(actions: string[]) {
    try {
      const tools = await this.toolset.getTools({
        actions: actions
      });
      return tools;
    } catch (error) {
      console.error('Error fetching Gmail actions:', error);
      throw error;
    }
  }

  /**
   * Get all available tools for a specific app
   */
  async getToolsForApp(appName: string) {
    try {
      const tools = await this.toolset.getTools({
        apps: [appName]
      });
      return tools;
    } catch (error) {
      console.error(`Error fetching tools for ${appName}:`, error);
      throw error;
    }
  }

  /**
   * Check if Gmail tools are available
   */
  async isGmailAvailable() {
    try {
      const tools = await this.getGmailTools();
      return tools.length > 0;
    } catch (error) {
      console.error('Error checking Gmail availability:', error);
      return false;
    }
  }

  /**
   * Get connection URL for Gmail (for manual connection setup)
   */
  getGmailConnectionInstructions() {
    return {
      message: "To connect Gmail with Composio, run 'composio add gmail' in your terminal and follow the authentication flow.",
      documentation: "https://docs.composio.dev/apps/gmail"
    };
  }

  /**
   * Check Gmail integrations using Composio client
   */
  async checkGmailIntegrations() {
    try {
      const integrations = await this.composio.integrations.list({
        appName: "gmail",
      });

      const integrationItems = integrations.items || [];
      const hasGmailIntegration = integrationItems.length > 0;
      
      return {
        isConnected: hasGmailIntegration,
        integrations: integrationItems,
        totalIntegrations: integrationItems.length
      };
    } catch (error) {
      console.error('Error checking Gmail integrations:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const gmailService = new ComposioGmailService();

// Export the main toolset
export default toolset; 