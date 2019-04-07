function initViz() {
    var containerDiv = document.getElementById("tableauViz"),
    url = "https://public.tableau.com/views/HowDoPeopleReallyFeelAboutWomanLeadersinG7Countries/Dashboard1?:embed=y&:display_count=yes&:toolbar=no";
    var viz = new tableau.Viz(containerDiv, url);
}