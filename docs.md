upload pdf =>
     -> user request for presigned url to upload pdf (return url).
     -> update the url in book
     -> Aws lyambda will chunk the pdf and store in unique file (use pdf-lib).

Read Pdf =>
     ->user request for preassigned url to server.
     ->load chunk by chunk 
     ->and join the each chunk using pdf.js library



