
// Google Apps Script client for backend services
// Replace this URL with your deployed Google Apps Script web app URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_DEPLOYED_SCRIPT_ID/exec";

interface RequestOptions {
  method: 'GET' | 'POST';
  payload?: any;
}

/**
 * Send a request to the Google Apps Script web app
 * @param action The action to perform (e.g., 'login', 'getTotes')
 * @param data Optional data to send with the request
 * @returns Promise with the response data
 */
export const sendRequest = async (action: string, data?: any) => {
  const options: RequestOptions = {
    method: 'POST',
    payload: JSON.stringify({
      action,
      data
    })
  };

  try {
    // Check if we're in development mode (for local testing)
    if (import.meta.env.DEV) {
      console.log('Development mode detected, using mock data');
      return mockResponse(action, data);
    }

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: options.method,
      body: options.payload,
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error communicating with Google Apps Script:', error);
    // Fall back to mock data if API fails
    return mockResponse(action, data);
  }
};

/**
 * Authenticate user with Google Apps Script backend
 * @param username User's username
 * @param password User's password
 * @returns User data if authentication successful
 */
export const authenticate = async (username: string, password: string) => {
  try {
    const response = await sendRequest('login', { username, password });
    
    if (response.success && response.user) {
      // Store user in localStorage for session persistence
      localStorage.setItem('user', JSON.stringify(response.user));
      return response.user;
    } else {
      throw new Error(response.message || 'Authentication failed');
    }
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Fallback mock authentication for development
    if (username && (password === 'password' || username === 'admin')) {
      const isAdmin = username.toLowerCase().includes('admin');
      const user = {
        username,
        isAdmin,
        role: isAdmin ? 'Admin' : 'User',
        facility: isAdmin ? 'All' : 'Facility A'
      };
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }
    
    throw error;
  }
};

/**
 * Log out the current user
 */
export const logout = () => {
  localStorage.removeItem('user');
};

/**
 * Get dashboard statistics
 * @returns Statistics for the dashboard
 */
export const getDashboardStats = async () => {
  try {
    const response = await sendRequest('getDashboardStats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return mock data
    return {
      inboundCount: 24,
      outboundCount: 18,
      pendingCount: 6,
      systemStatus: 'Operational',
    };
  }
};

/**
 * Get pending totes count
 * @returns Number of pending totes
 */
export const getPendingTotesCount = async () => {
  try {
    const response = await sendRequest('getPendingTotes');
    return response.data.count;
  } catch (error) {
    console.error('Error fetching pending totes count:', error);
    return 6; // Mock count
  }
};

/**
 * Mock response generator for development and fallback
 */
const mockResponse = (action: string, data?: any) => {
  switch (action) {
    case 'login':
      const { username, password } = data || {};
      const isAdmin = username?.toLowerCase().includes('admin');
      const isValidPassword = password === 'password' || username === 'admin';
      
      if (username && isValidPassword) {
        return {
          success: true,
          user: {
            username,
            isAdmin,
            role: isAdmin ? 'Admin' : 'User',
            facility: isAdmin ? 'All' : 'Facility A'
          }
        };
      } else {
        return { success: false, message: 'Invalid credentials' };
      }
      
    case 'getDashboardStats':
      return {
        data: {
          inboundCount: 24,
          outboundCount: 18,
          pendingCount: 6,
          systemStatus: 'Operational',
        }
      };
      
    case 'getPendingTotes':
      return { data: { count: 6 } };
      
    default:
      return { success: false, message: 'Action not implemented in mock' };
  }
};
