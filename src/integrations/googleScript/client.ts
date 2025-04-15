
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
    throw error;
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
    throw error;
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
    return 0;
  }
};
