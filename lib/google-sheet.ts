import * as sheetsApi from '@googleapis/sheets';
import env from './env';

export async function fetchGoogleSheet(email: string, token: string, source: string, contentFields: string[], lookupColumn: string, lookupValue: any): Promise<any | null> {
    try {

        const auth = new sheetsApi.auth.OAuth2({
            clientId: env.google.clientId,
            clientSecret: env.google.clientSecret,
        })

        auth.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        })
        auth.refreshHandler = async () => {
            const newToken = await fetch(`https://oauth2.googleapis.com/token?refresh_token=${token}&client_id=${env.google.clientId}&client_secret=${env.google.clientSecret}&grant_type=refresh_token`, {
                method: 'POST',
            });
            const data = await newToken.json();
            console.info(' refreshHandler data', data)
            auth.setCredentials({
                access_token: data.access_token,
            });
            return {
                access_token: data.access_token,
                expiry_date: data.expires_in,
            }
        }
        const sheets = sheetsApi.sheets({ version: 'v4', auth });

        // Get data from the Google Sheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: source,
            range: 'Sheet1', // Change 'Sheet1' to the name of your sheet
        });

        console.info('response', response.data)

        const rows = response.data.values;

        if (rows?.length) {
            const headerRow = rows[0];
            const columnIndexMap: { [key: string]: number } = {};

            // Map column indices to their respective column names
            headerRow.forEach((header, index) => {
                columnIndexMap[header] = index;
            });

            // Find the index of the lookup column
            const lookupColumnIndex = columnIndexMap[lookupColumn];

            if (lookupColumnIndex !== undefined) {
                // Search for the row containing the lookup value
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    if (row[lookupColumnIndex] === lookupValue) {
                        // Extract data according to the provided contentFields
                        const rowData: { [key: string]: string } = {};
                        contentFields.forEach(field => {
                            const columnIndex = columnIndexMap[field];
                            if (columnIndex !== undefined) {
                                rowData[field] = row[columnIndex] || ''; // Ensure data exists or default to an empty string
                            } else {
                                rowData[field] = ''; // If field doesn't exist, set to an empty string
                            }
                        });
                        return rowData;
                    }
                }
                console.error('Lookup value not found.');
                return null;
            } else {
                console.error('Lookup column not found.');
                return null;
            }
        } else {
            console.error('No data found.');
            return null;
        }
    } catch (error: any) {
        console.error('The API returned an error:', error);
        throw new Error(error.message);
    }
}