var baseURL = 'https://api.covid19api.com/total/';
var myArray;
var myDataSet = [];
var chartLabel;
var plottedValues = [];
//Color codes for the shade of graphs
var myShades = ['#ff0000', '#00ff00', '#0000ff', '#00FFFF', '#6A5ACD', '#800080', '#FF69B4', '#800000', '#008B8B', '#6B8E23'];
var shade = 0;
var myDebug = 0;
var prevLength = 0;
var xaxis;
//chart.js chart element variable
var ctx = document.getElementById('myChart').getContext('2d');
//initialize the lineChart to a known value
var lineChart = 42;

//Vue component to show the table on the page
Vue.component('streaming-quiz', {
  template: `<div v-bind:class = "['quiz']">
    <h3>{{quiz.Country}}</h3>
    <small>{{quiz.Cases}}</small>
    <small>{{quiz.Date}}</small>
    <small>{{quiz.CountryCode}}</small>
  </div>`,
  props: ['quiz']
});

//new Vue variable to have a promise based reqquest to RESTful API
//API is located here: https://covid19api.com/
//Documentation is available here: https://documenter.getpostman.com/view/10808728/SzS8rjbc?version=latest#63fda84a-6b43-4506-9cc7-2172561d5c16
var vm = new Vue({
  el: '#app',
  data: {
    //Following is the default data to plot when the page loads
    defaultCategory: 'confirmed',
    defaultCountry: 'united-states',
    defaultStartDate: '2020-03-01',
    defaultEndDate: '2020-03-21',
    questions: []
  },
  methods: {
    getQuestions: function () {
      console.log('defaultCountry is:', this.defaultCountry);
      axios.get(baseURL + 'country/' + this.defaultCountry + '/status/' + this.defaultCategory,
        { params: { from: this.defaultStartDate + 'T00:00:00Z', to: this.defaultEndDate + 'T00:00:00Z' } }).then(response => {
        if (typeof myArray === 'object') {
          prevLength = myArray.length;
        }
        //Copy off the data to another object
        vm.questions = response.data;
        //pop the last element
        vm.questions.pop();
        //Deep copy the array to another array
        myArray = vm.questions.slice();

        //This is the variable to hold Y axis values, initialize to avoid spurious values
        myDataSet = [];
        //ChartLabel to show the Graph title
        chartLabel = 'Coronavirus ' + this.defaultCategory + ' cases in ' + this.defaultCountry + ' from ' + this.defaultStartDate + ' to ' + this.defaultEndDate;

        console.log('>>>chartLabel: ', chartLabel);
        console.log('>>>response.data: ', response.data);

        // Use chartLabel to only plot unique series and DONOT PLOT same series again and agains and again
        if (!plottedValues.includes(chartLabel)) {
          console.log('unique value found push to array', plottedValues);
          plottedValues.push(chartLabel);
        } else {
          console.log('duplicate value found, punt!!');
          return;
        }
        console.log('>>>>', plottedValues);

        // Populate the data to be printed on y axis
        for (let i = 0; i < (myArray.length); i++) {
          myDataSet[i] = myArray[i].Cases;
        }

        // Populate corresponding x axis
        xaxis = Array.from(Array(myArray.length).keys())

        // Since I have the x and yaxis; My graph goes here ---->
        console.log('>>>>chartDataSet:', myDataSet);

        // This is the first time creating graphs, we initialized it to a know value --->>
        if (typeof lineChart === 'number') {
          console.log('it is a number');
          //Create a new chart element
          lineChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: xaxis,
              datasets: [
                {
                  label: chartLabel,
                  data: myDataSet
                }
              ]
            },
            options: {
              tooltips: {
                mode: 'nearest',
                axis: 'y'
              }
            }
          });
          return;
        }
        // Any subsequent graph creation goes below--->>
        // Should append to exisisting graphs
        console.log('    >>>>', plottedValues.includes(chartLabel));
        // Push the new data sereis' X-axis so that graphs scales accordingly
        for (let j = prevLength; j < myArray.length; j++) {
          lineChart.data.labels.push(j);
        }
        // Push the new data sereis' Y-axis so that graphs is updated
        lineChart.data.datasets.push({
          label: chartLabel,
          backgroundColor: myShades[shade],
          data: myDataSet
        });
        // Update the graph to show old and new data
        lineChart.update();
        // Increment the shade so that new graph is of different color
        shade = shade + 1;
        // Only plot different sereies and DONOT PLOT same series again and agains and again
        // Push the chart lable, we will use this to only plot graphs that are not already plotted!!
        plottedValues.push(chartLabel);
        // My graph goes here <----
      });
    }
  },
  created: function () {
    this.getQuestions();
  }
})
