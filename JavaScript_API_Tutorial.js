// Create the Viz
// As you build your web application, the first step is to create, or instantiate the view. To do this, you create a new Viz object, passing the required parentElement (document.getElementByID) and url parameters, along with any options, such as hideTabs and hideToolbar. Here's the code:
function initializeViz() {
  var placeholderDiv = document.getElementById("tableauViz");
  var url = "https://public.tableau.com/views/WorldIndicators/GDPpercapita";
  var options = {
    width: placeholderDiv.offsetWidth,
    height: placeholderDiv.offsetHeight,
    hideTabs: true,
    hideToolbar: true,
    onFirstInteractive: function () {
      workbook = viz.getWorkbook();
      activeSheet = workbook.getActiveSheet();
    }
  };
  viz = new tableau.Viz(placeholderDiv, url, options);
}      

// In the code above, the constructor for the Viz object handles loading the view. Specifying a function in the onFirstInteractive option allows you to perform actions once the view has finished loading. In this case, the function caches the workbook and activeSheet variables so they can be used later on. These two variables were declared as global variables in the actual script. Typically you'll want to create the view when the page has finished loading and the browser is ready. If you're using jQuery, this can be done using jQuery's ready handler:

$(initializeViz);

function removeValuesFromFilter() {
  activeSheet.applyFilterAsync(
    "Region",
    "Europe",
    tableau.FilterUpdateType.REMOVE);
} 

// The filters you've seen so far have all had associated quick filters in the view. However, you can also create new filters. For example, you can create a filter for the x-axis, the "F: GDP per capita (curr $)" field, and specify that you only want to see countries where the GDP is greater than $40K, but less than $60K. To do this, you use the applyRangeFilter method, using a range of values as the criteria:

function filterRangeOfValues() {
  activeSheet.applyRangeFilterAsync(
    "F: GDP per capita (curr $)",
    {
      min: 40000,
      max: 60000
    },
    tableau.FilterUpdateType.REPLACE);
}      

// Finally, you can clear the filters. For example:

function clearFilters() {
  activeSheet.clearFilterAsync("Region");
  activeSheet.clearFilterAsync("F: GDP per capita (curr $)");
}      

// Switch Tabs
// Sometimes a single sheet in a workbook doesn't convey all of the information that you'd like your user to see. You can use the API to switch from the current sheet to another published sheet within the same workbook (note that the workbook must have been published to the server with Show Sheets as Tabs enabled). To switch sheets, you use the activateSheetAsync method on a Workbook object, which was cached in a global workbook variable in step 1. Here's how you switch the sheet to a map worksheet named "GDP per capita map".

function switchToMapTab() {
  workbook.activateSheetAsync("GDP per capita map");
}

// Select Values
// Filtering a view is useful when you want to focus the user's attention on a specific set of values by removing all other values not matching the filter criteria. However, sometimes it's useful to select values instead. This still focuses the user's attention on specific values, but the context of other values remains in the view. To do this, you use the selectMarksAsync method. The syntax is very similar to the applyFilterAsync method that you used previously. For example, the following code selects all of the marks in the "Asia" region:

function selectSingleValue() {
  workbook.getActiveSheet().selectMarksAsync(
    "Region",
    "Asia",
    tableau.SelectionUpdateType.REPLACE);
}

// The only change between the code above and the filter code you used earlier is that tableau.SelectionUpdateType was specified instead of tableau.FilterUpdateType. Also, notice that workbook.getActiveSheet() is used instead of the activeSheet global variable because the sheets were switched in step 3 and the global variable wasn't updated to point to the new active sheet.
// In the following code sample, Africa and Oceania are added to the previous selection:

function addValuesToSelection() {
  workbook.getActiveSheet().selectMarksAsync(
    "Region",
    ["Africa", "Oceania"],
    tableau.FilterUpdateType.ADD);
}      

// Again, the code should look familiar since the syntax is almost identical to filtering. At this point, you've selected Asia, Africa, and Oceania. The next code sample will demonstrate how to remove. In this case, you will remove countries that have a GDP less than $5,000. To do this, you use a range just like you did for filtering, except you'll only specify a max value:

function removeFromSelection() {
  workbook.getActiveSheet().selectMarksAsync(
    "AVG(F: GDP per capita (curr $))",
    {
      max: 5000
    },
    tableau.FilterUpdateType.REMOVE);
}  

// Clearing the selection is just as easy as clearing a filter, using the clearSelectedMarksAsync method:

function clearSelection() {
  workbook.getActiveSheet().clearSelectedMarksAsync();
} 

// Chain Method Calls
// The Tableau JavaScript API uses Promises (specifically the Promises/A specification) to notify your code when an operation is complete. This allows you to chain method calls using an easy syntax. Each method that ends with Async returns a Promise object, containing three methods:

// then(successCallback, errorCallback) - the successCallback function is called when the operation is successful, and likewise the errorCallback function is called when there is an error. Both parameters are optional.
// otherwise(errorCallback) - called when an error occurs
// always(callback) - always called, whether the operation was successful or not

// The following code sample demonstrates how you can use some of the methods you've learned thus far to chain a series of commands. First you switch to the "GDP per capita by region" sheet. After that has finished, you apply a range filter. Once Tableau Server has applied the filter, you select some marks.

function switchTabsThenFilterThenSelectMarks() {
  workbook.activateSheetAsync("GDP per capita by region")
    .then(function (newSheet) {
      activeSheet = newSheet;

      // It's important to return the promise so the next link in the chain
      // won't be called until the filter completes.
      return activeSheet.applyRangeFilterAsync(
        "Date (year)",
        {
          min: new Date(Date.UTC(2002, 1, 1)),
          max: new Date(Date.UTC(2008, 12, 31))
        },
        tableau.FilterUpdateType.REPLACE);
    })
    .then(function (filterFieldName) {
      return activeSheet.selectMarksAsync(
        "AGG(GDP per capita (weighted))",
        {
          min: 20000
        },
        tableau.SelectionUpdateType.REPLACE);
    });
}      


// Before moving on to the next step, let's take a look at how errors are handled inside a chain. The code below intentionally causes an error to happen by leaving out some required parameters to the applyFilterAsync method:

function triggerError() {
  workbook.activateSheetAsync("GDP per capita by region")
    .then(function (newSheet) {
      // Do something that will cause an error: leave out required parameters.
      return activeSheet.applyFilterAsync("Date (year)");
    })
    .otherwise(function (err) {
      alert("We purposely triggered this error to show how error handling happens with chained calls.\n\n " + err);
    });
}    

// Work with Sheets

// The code samples below illustrate how this works. The first code sample demonstrates how you would query all of a workbook's sheets. After you click Run this code the dialog that appears lists workbook's sheets:

function querySheets() {
  var sheets = workbook.getPublishedSheetsInfo();
  var text = getSheetsAlertText(sheets);
  text = "Sheets in the workbook:\n" + text;
  alert(text);
}  

// Here's how you would query worksheets in a dashboard. Notice that the filter is still applied to the "GDP per region" worksheet in the dashboard, but the marks are not selected:

function queryDashboard() {
  workbook.activateSheetAsync("GDP per Capita Dashboard")
    .then(function (dashboard) {
      var worksheets = dashboard.getWorksheets();
      var text = getSheetsAlertText(worksheets);
      text = "Worksheets in the dashboard:\n" + text;
      alert(text);
    });
}    

// You'll notice that there are scrollbars on the viz. This is because the fixed size specified in the Viz constructor (step 1) is different than the fixed size specified for this dashboard by the workbook author. To see the entire dashboard, you can change the size behavior to AUTOMATIC, which tells the viz to fit the available space. This removes the scrollbars at the expense of making each Worksheet in the dashboard slightly smaller.

function changeDashboardSize() {
  workbook.activateSheetAsync("GDP per Capita Dashboard")
    .then(function (dashboard) {
      dashboard.changeSizeAsync({
        behavior: tableau.SheetSizeBehavior.AUTOMATIC
      });
    });
}

// Now, here's how you select filters and change settings on multiple sheets within a dashboard. The code sample applies to a dashboard with two worksheets:

var dashboard, mapSheet, graphSheet;
  workbook.activateSheetAsync("GDP per Capita Dashboard")
    .then(function (sheet) {
      dashboard = sheet;
      mapSheet = dashboard.getWorksheets().get("Map of GDP per capita");
      graphSheet = dashboard.getWorksheets().get("GDP per capita by region");
      return mapSheet.applyFilterAsync("Region", "Middle East", tableau.FilterUpdateType.REPLACE);
    })
    .then(function () {
      // Do these two steps in parallel since they work on different sheets.
      mapSheet.applyFilterAsync("YEAR(Date (year))", 2010, tableau.FilterUpdateType.REPLACE);
      return graphSheet.clearFilterAsync("Date (year)");
    })
    .then(function () {
      return graphSheet.selectMarksAsync("YEAR(Date (year))", 2010, tableau.SelectionUpdateType.REPLACE);
    });
}      

// Control Toolbar Commands

// Tableau Server toolbar commands are available from the Viz object, which is the highest level object. Some commands act on the entire worksheet or dashboard, and some act on only the selected zone. Export PDF and Export Image act on the entire worksheet or dashboard. Here's the code for Export PDF:

function exportPDF() {
  viz.showExportPDFDialog();
} 

// And here's the code for Export Image:

function exportImage() {
  viz.showExportImageDialog();
}  

// The code for Export as CSV is as follows:

function exportCrossTab() {
  viz.showExportCrossTabDialog();
} 

// When there aren't parameters specified for Export as Crosstab or Export Data, the currently selected zone is exported. You can also specify a sheet name or you can pass in a sheet object. Here's the code for Export Data:

function exportData() {
  viz.showExportDataDialog();
}  

// Finally, the Revert All command restores the workbook to its original, published state:

function revertAll() {
  workbook.revertAllAsync();
}

// Listen for Events

function listenToMarksSelection() {
  viz.addEventListener(tableau.TableauEventName.MARKS_SELECTION, onMarksSelection);
}

function onMarksSelection(marksEvent) {
  return marksEvent.getMarksAsync().then(reportSelectedMarks);
}

function reportSelectedMarks(marks) {
  var html = [];
  for (var markIndex = 0; markIndex < marks.length; markIndex++) {
    var pairs = marks[markIndex].getPairs();
    html.push("<b>Mark " + markIndex + ":</b><ul>");
    for (var pairIndex = 0; pairIndex < pairs.length; pairIndex++) {
      var pair = pairs[pairIndex];
      html.push("<li><b>fieldName:</b> " + pair.fieldName);
      html.push("<br/><b>formattedValue:</b> " + pair.formattedValue + "</li>");
    }
    html.push("</ul>");
  }

  var dialog = $("#dialog");
  dialog.html(html.join(""));
  dialog.dialog("open");
}      

// To stop listening to the event, you call the removeEventListener method, passing the same function that you specified in addEventListener:

function removeMarksSelectionEventListener() {
  viz.removeEventListener(tableau.TableauEventName.MARKS_SELECTION, onMarksSelection);
}  
