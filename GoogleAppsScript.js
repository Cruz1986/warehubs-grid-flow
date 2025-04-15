
// This file is not part of your React project - it's a reference for the Google Apps Script you need to create
// Once created, deploy it as a web app and copy the URL to GOOGLE_SCRIPT_URL in client.ts

// Replace SHEET_ID with your Google Sheet ID from the URL
const SHEET_ID = '1ueswDlR3Xnb25Qk7bGhFOkzN2zSnleOF10thwIyoVGM';
const USER_SHEET_NAME = 'Users'; // Name of your users sheet
const FACILITIES_SHEET_NAME = 'Facilities'; // Assuming you have a facilities sheet
const GRID_MAPPINGS_SHEET_NAME = 'GridMappings'; // Assuming you have a grid mappings sheet
const TOTES_SHEET_NAME = 'Totes'; // Assuming you have a totes sheet

// Main function that handles all web app requests
function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  const action = params.action;
  const data = params.data;
  
  let result;
  
  try {
    switch (action) {
      case 'login':
        result = handleLogin(data.username, data.password);
        break;
      case 'updateLastLogin':
        result = updateLastLogin(data.userId);
        break;
      case 'getFacilities':
        result = getFacilities();
        break;
      case 'addFacility':
        result = addFacility(data);
        break;
      case 'getGridMappings':
        result = getGridMappings();
        break;
      case 'addGridMapping':
        result = addGridMapping(data);
        break;
      case 'deleteGridMapping':
        result = deleteGridMapping(data.id);
        break;
      case 'getTotesByStatus':
        result = getTotesByStatus(data.status);
        break;
      default:
        result = { success: false, message: 'Invalid action' };
    }
  } catch (error) {
    result = { success: false, message: error.toString() };
  }
  
  // Return result as JSON
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handle login action
function handleLogin(username, password) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const userSheet = ss.getSheetByName(USER_SHEET_NAME);
  const users = getSheetData(userSheet);
  
  // Find user by username and password
  const user = users.find(u => 
    u.Username === username && 
    u.Password === password && 
    u.Status === 'Active'
  );
  
  if (user) {
    return {
      success: true,
      user: {
        id: user.User_ID,
        username: user.Username,
        role: user.Role,
        status: user.Status,
        lastLogin: user.Last_Login
      }
    };
  } else {
    return { success: false, message: 'Invalid credentials or account inactive' };
  }
}

// Update last login timestamp
function updateLastLogin(userId) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const userSheet = ss.getSheetByName(USER_SHEET_NAME);
  const users = getSheetData(userSheet);
  
  // Find user row by ID
  const userData = users.find(u => u.User_ID === userId);
  if (!userData) {
    return { success: false, message: 'User not found' };
  }
  
  // Find the row index (adding 2 for header row and 0-indexing)
  const userRowIndex = users.indexOf(userData) + 2;
  
  // Get the column index for Last_Login
  const headers = userSheet.getRange(1, 1, 1, userSheet.getLastColumn()).getValues()[0];
  const lastLoginColIndex = headers.indexOf('Last_Login') + 1;
  
  if (lastLoginColIndex > 0) {
    // Update last login timestamp
    const now = new Date();
    const formattedDate = Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss');
    userSheet.getRange(userRowIndex, lastLoginColIndex).setValue(formattedDate);
    
    return { success: true };
  } else {
    return { success: false, message: 'Last_Login column not found' };
  }
}

// Get facilities
function getFacilities() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const facilitiesSheet = ss.getSheetByName(FACILITIES_SHEET_NAME);
  
  if (!facilitiesSheet) {
    return { success: true, data: [] }; // Return empty array if sheet doesn't exist
  }
  
  const facilities = getSheetData(facilitiesSheet);
  return { success: true, data: facilities };
}

// Add a new facility
function addFacility(facilityData) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const facilitiesSheet = ss.getSheetByName(FACILITIES_SHEET_NAME);
  
  if (!facilitiesSheet) {
    // Create the sheet if it doesn't exist
    const newSheet = ss.insertSheet(FACILITIES_SHEET_NAME);
    newSheet.appendRow(['id', 'name', 'type', 'location']);
  }
  
  // Generate UUID for the new facility
  const facilityId = Utilities.getUuid();
  facilitiesSheet.appendRow([
    facilityId,
    facilityData.name,
    facilityData.type,
    facilityData.location
  ]);
  
  return { 
    success: true, 
    data: { 
      id: facilityId, 
      ...facilityData 
    } 
  };
}

// Get grid mappings
function getGridMappings() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const gridMappingsSheet = ss.getSheetByName(GRID_MAPPINGS_SHEET_NAME);
  
  if (!gridMappingsSheet) {
    return { success: true, data: [] }; // Return empty array if sheet doesn't exist
  }
  
  const gridMappings = getSheetData(gridMappingsSheet);
  return { success: true, data: gridMappings };
}

// Add a new grid mapping
function addGridMapping(mappingData) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const gridMappingsSheet = ss.getSheetByName(GRID_MAPPINGS_SHEET_NAME);
  
  if (!gridMappingsSheet) {
    // Create the sheet if it doesn't exist
    const newSheet = ss.insertSheet(GRID_MAPPINGS_SHEET_NAME);
    newSheet.appendRow(['id', 'source', 'sourceType', 'destination', 'destinationType', 'gridNumber']);
  }
  
  // Generate UUID for the new mapping
  const mappingId = Utilities.getUuid();
  gridMappingsSheet.appendRow([
    mappingId,
    mappingData.source,
    mappingData.sourceType,
    mappingData.destination,
    mappingData.destinationType,
    mappingData.gridNumber
  ]);
  
  return { 
    success: true, 
    data: { 
      id: mappingId, 
      ...mappingData 
    } 
  };
}

// Delete a grid mapping
function deleteGridMapping(id) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const gridMappingsSheet = ss.getSheetByName(GRID_MAPPINGS_SHEET_NAME);
  
  if (!gridMappingsSheet) {
    return { success: false, message: 'Grid mappings sheet not found' };
  }
  
  const gridMappings = getSheetData(gridMappingsSheet);
  const mappingToDelete = gridMappings.find(m => m.id === id);
  
  if (!mappingToDelete) {
    return { success: false, message: 'Grid mapping not found' };
  }
  
  // Find the row index (adding 2 for header row and 0-indexing)
  const rowIndex = gridMappings.indexOf(mappingToDelete) + 2;
  gridMappingsSheet.deleteRow(rowIndex);
  
  return { success: true };
}

// Get totes by status
function getTotesByStatus(status) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const totesSheet = ss.getSheetByName(TOTES_SHEET_NAME);
  
  if (!totesSheet) {
    return { success: true, data: [] }; // Return empty array if sheet doesn't exist
  }
  
  const totes = getSheetData(totesSheet);
  const filteredTotes = totes.filter(t => t.status === status);
  
  return { success: true, data: filteredTotes };
}

// Helper function to convert sheet data to JSON
function getSheetData(sheet) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
}
