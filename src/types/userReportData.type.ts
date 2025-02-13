export interface UserReportDataRequest {
  start: string;        // The start date in ISO 8601 format
  end: string;          // The end date in ISO 8601 format
  type: string;      // The type of the request (constant value "PROJECT")
  sortOrder: string; // Sorting order
  sortColumn: string;        // The column by which to sort
  page: number;         // The page number for pagination
  pageSize: number;  // The size of the page for pagination
};
