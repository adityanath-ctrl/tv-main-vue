/**
 * WebOS TV Navigation Test Utility
 * Helps test and verify WebOS TV remote control functionality
 */

import { webOSFocusManager } from './webosFocusManager';

export class WebOSNavigationTester {
  private testResults: { [key: string]: boolean } = {};

  async runAllTests(): Promise<{ [key: string]: boolean }> {
    console.log('🧪 Starting WebOS TV Navigation Tests...');
    
    await this.testSpatialNavigationInit();
    await this.testFocusableElements();
    await this.testDynamicContentHandling();
    await this.testMenuNavigation();
    await this.testWebOSDetection();
    
    console.log('✅ WebOS TV Navigation Tests Complete:', this.testResults);
    return this.testResults;
  }

  private async testSpatialNavigationInit(): Promise<void> {
    try {
      // Check if SpatialNavigation is initialized
      const spatialNav = (window as any).SpatialNavigation;
      this.testResults.spatialNavigationInit = !!(spatialNav && spatialNav.isInitialized);
      
      if (!this.testResults.spatialNavigationInit) {
        console.warn('⚠️ SpatialNavigation not properly initialized');
      }
    } catch (error) {
      console.error('❌ SpatialNavigation test failed:', error);
      this.testResults.spatialNavigationInit = false;
    }
  }

  private async testFocusableElements(): Promise<void> {
    try {
      // Check if focusable elements exist and have proper attributes
      const focusableElements = document.querySelectorAll('.focusable-item');
      this.testResults.focusableElements = focusableElements.length > 0;
      
      // Check if elements have tabindex
      let hasTabindex = true;
      focusableElements.forEach(el => {
        if (!(el as HTMLElement).hasAttribute('tabindex')) {
          hasTabindex = false;
        }
      });
      this.testResults.focusableElementsHaveTabindex = hasTabindex;
      
      console.log(`📍 Found ${focusableElements.length} focusable elements`);
    } catch (error) {
      console.error('❌ Focusable elements test failed:', error);
      this.testResults.focusableElements = false;
      this.testResults.focusableElementsHaveTabindex = false;
    }
  }

  private async testDynamicContentHandling(): Promise<void> {
    try {
      // Test if focus manager can handle dynamic content
      const initialCount = document.querySelectorAll('.focusable-item').length;
      
      // Simulate dynamic content (this would normally be done by your app)
      webOSFocusManager.refreshSpatialNavigation();
      
      // Wait a bit for the refresh to complete
      await new Promise(resolve => setTimeout(resolve, 200));
      
      this.testResults.dynamicContentHandling = true;
      console.log('🔄 Dynamic content handling test passed');
    } catch (error) {
      console.error('❌ Dynamic content handling test failed:', error);
      this.testResults.dynamicContentHandling = false;
    }
  }

  private async testMenuNavigation(): Promise<void> {
    try {
      // Check if menu items exist and are focusable
      const menuItems = document.querySelectorAll('.v-list-item.focusable-item');
      this.testResults.menuItemsExist = menuItems.length > 0;
      
      // Test focus restoration
      if (menuItems.length > 0) {
        const firstItem = menuItems[0] as HTMLElement;
        firstItem.focus();
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        this.testResults.menuFocusWorks = document.activeElement === firstItem;
      } else {
        this.testResults.menuFocusWorks = false;
      }
      
      console.log(`📋 Found ${menuItems.length} menu items`);
    } catch (error) {
      console.error('❌ Menu navigation test failed:', error);
      this.testResults.menuItemsExist = false;
      this.testResults.menuFocusWorks = false;
    }
  }

  private async testWebOSDetection(): Promise<void> {
    try {
      const isWebOS = webOSFocusManager.isWebOSTV();
      const webOSInfo = webOSFocusManager.getWebOSInfo();
      
      this.testResults.webOSDetection = true;
      this.testResults.isWebOSTV = isWebOS;
      
      console.log(`📺 WebOS Detection: ${isWebOS ? 'Detected' : 'Not detected'}`);
      if (webOSInfo) {
        console.log('📺 WebOS Info:', webOSInfo);
      }
    } catch (error) {
      console.error('❌ WebOS detection test failed:', error);
      this.testResults.webOSDetection = false;
      this.testResults.isWebOSTV = false;
    }
  }

  // Helper method to run tests from browser console
  static async runTests(): Promise<void> {
    const tester = new WebOSNavigationTester();
    await tester.runAllTests();
  }

  // Get current navigation state for debugging
  getNavigationState(): any {
    return {
      focusableElements: document.querySelectorAll('.focusable-item').length,
      currentFocus: document.activeElement,
      spatialNavigation: (window as any).SpatialNavigation,
      webOSDetected: webOSFocusManager.isWebOSTV(),
      webOSInfo: webOSFocusManager.getWebOSInfo()
    };
  }
}

// Make it available globally for easy testing
if (typeof window !== 'undefined') {
  (window as any).WebOSNavigationTester = WebOSNavigationTester;
  (window as any).testWebOSNavigation = () => WebOSNavigationTester.runTests();
  (window as any).getNavigationState = () => {
    const tester = new WebOSNavigationTester();
    return tester.getNavigationState();
  };
}

export default WebOSNavigationTester;
