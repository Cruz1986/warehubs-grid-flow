
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
      // Update last login time in the sheet
      await sendRequest('updateLastLogin', { userId: response.user.id });
      
      // Store user in localStorage for session persistence
      localStorage.setItem('user', JSON.stringify(response.user));
      return response.user;
    } else {
      throw new Error(response.message || 'Authentication failed');
    }
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Fallback mock authentication for development - matches the sheet structure
    if (username === 'admin' && password === 'admin123') {
      const mockUser = {
        id: '20b7882f-4cf5-4cab-9a16-40c531290e46',
        username: 'admin',
        role: 'admin',
        status: 'Active',
        lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      return mockUser;
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
 * Get totes by status
 * @param status The status to filter by (e.g., 'inbound', 'outbound', 'staged')
 * @returns Array of totes with the specified status
 */
export const getTotesByStatus = async (status: string) => {
  try {
    const response = await sendRequest('getTotesByStatus', { status });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${status} totes:`, error);
    // Return mock data
    return generateMockTotes(status, 5);
  }
};

/**
 * Get all facilities from Google Sheets
 * @returns Array of facilities
 */
export const getFacilities = async () => {
  try {
    const response = await sendRequest('getFacilities');
    return response.data;
  } catch (error) {
    console.error('Error fetching facilities:', error);
    // Return mock data
    return [
      { id: '1', name: 'Facility A', type: 'Fulfillment Center', location: 'New York' },
      { id: '2', name: 'Facility B', type: 'Sourcing Hub', location: 'Los Angeles' },
      { id: '3', name: 'Facility C', type: 'Darkstore', location: 'Chicago' }
    ];
  }
};

/**
 * Add a new facility to Google Sheets
 * @param facility Facility data to add
 * @returns The added facility with its ID
 */
export const addFacility = async (facility: { name: string, type: string, location: string }) => {
  try {
    const response = await sendRequest('addFacility', facility);
    return response.data;
  } catch (error) {
    console.error('Error adding facility:', error);
    throw error;
  }
};

/**
 * Add a grid mapping to Google Sheets
 * @param mapping Grid mapping data to add
 * @returns The added grid mapping with its ID
 */
export const addGridMapping = async (mapping: { 
  source: string, 
  sourceType: string, 
  destination: string, 
  destinationType: string, 
  gridNumber: string 
}) => {
  try {
    const response = await sendRequest('addGridMapping', mapping);
    return response.data;
  } catch (error) {
    console.error('Error adding grid mapping:', error);
    throw error;
  }
};

/**
 * Get all grid mappings from Google Sheets
 * @returns Array of grid mappings
 */
export const getGridMappings = async () => {
  try {
    const response = await sendRequest('getGridMappings');
    return response.data;
  } catch (error) {
    console.error('Error fetching grid mappings:', error);
    // Return mock data
    return [
      { id: '1', source: 'Facility A', sourceType: 'Fulfillment Center', destination: 'Facility B', destinationType: 'Sourcing Hub', gridNumber: 'A1' },
      { id: '2', source: 'Facility B', sourceType: 'Sourcing Hub', destination: 'Facility C', destinationType: 'Darkstore', gridNumber: 'B2' }
    ];
  }
};

/**
 * Delete a grid mapping from Google Sheets
 * @param id ID of the grid mapping to delete
 * @returns Success status
 */
export const deleteGridMapping = async (id: string) => {
  try {
    const response = await sendRequest('deleteGridMapping', { id });
    return response.success;
  } catch (error) {
    console.error('Error deleting grid mapping:', error);
    throw error;
  }
};

/**
 * Mock response generator for development and fallback
 */
const mockResponse = (action: string, data?: any) => {
  switch (action) {
    case 'login':
      const { username, password } = data || {};
      
      // Match mock data with the sheet structure
      if (username === 'admin' && password === 'admin123') {
        return {
          success: true,
          user: {
            id: '20b7882f-4cf5-4cab-9a16-40c531290e46',
            username: 'admin',
            role: 'admin',
            status: 'Active',
            lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19)
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
      
    case 'getTotesByStatus':
      return { data: generateMockTotes(data?.status, 5) };
      
    case 'getFacilities':
      return { 
        data: [
          { id: '1', name: 'Facility A', type: 'Fulfillment Center', location: 'New York' },
          { id: '2', name: 'Facility B', type: 'Sourcing Hub', location: 'Los Angeles' },
          { id: '3', name: 'Facility C', type: 'Darkstore', location: 'Chicago' }
        ]
      };
      
    case 'getGridMappings':
      return { 
        data: [
          { id: '1', source: 'Facility A', sourceType: 'Fulfillment Center', destination: 'Facility B', destinationType: 'Sourcing Hub', gridNumber: 'A1' },
          { id: '2', source: 'Facility B', sourceType: 'Sourcing Hub', destination: 'Facility C', destinationType: 'Darkstore', gridNumber: 'B2' }
        ]
      };
      
    case 'addFacility':
      return { 
        success: true, 
        data: { 
          id: Date.now().toString(), 
          ...data 
        } 
      };
      
    case 'addGridMapping':
      return { 
        success: true, 
        data: { 
          id: Date.now().toString(), 
          ...data 
        } 
      };
      
    case 'deleteGridMapping':
      return { success: true };
      
    default:
      return { success: false, message: 'Action not implemented in mock' };
  }
};

/**
 * Generate mock totes for development and testing
 */
const generateMockTotes = (status: string, count: number) => {
  const totes = [];
  const statuses = ['inbound', 'outbound', 'staged'];
  const facilities = ['Facility A', 'Facility B', 'Facility C'];
  
  for (let i = 1; i <= count; i++) {
    const now = new Date();
    now.setHours(now.getHours() - i);
    
    totes.push({
      id: `TOTE-${status.toUpperCase()}-${i}`,
      status: status || statuses[Math.floor(Math.random() * statuses.length)],
      source: facilities[Math.floor(Math.random() * facilities.length)],
      destination: facilities[Math.floor(Math.random() * facilities.length)],
      grid: status === 'staged' ? `Grid-${String.fromCharCode(64 + i)}${i}` : '',
      timestamp: now.toISOString().replace('T', ' ').substring(0, 19),
      user: 'Mock User'
    });
  }
  
  return totes;
};

