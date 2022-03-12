
async function submit_message() {
  var fixed_acidity = document.getElementById("Fixed_Acidity");
  var volatile_acidity = document.getElementById("Volatile_Acidity");
  var citric_acid = document.getElementById("Citric_Acid");
  var residual_sugar = document.getElementById("Residual_Sugar");
  var chlorides = document.getElementById("Chlorides");
  var free_sulfur_dioxide = document.getElementById("Free_Sulfur_Dioxide");
  var total_sulfur_dioxide = document.getElementById("Total_Sulfur_Dioxide");
  var density = document.getElementById("Density");
  var pH = document.getElementById("pH");
  var sulphates = document.getElementById("Sulphates");
  var alcohol = document.getElementById("Alcohol");
  var red_wine = document.getElementById("Red_Wine");
  var white_wine = document.getElementById("White_Wine");

  var entry = {
      fixed_acidity: fixed_acidity.value,
      volatile_acidity: volatile_acidity.value,
      citric_acid: citric_acid.value,
      residual_sugar: residual_sugar.value,
      chlorides: chlorides.value,
      free_sulfur_dioxide: free_sulfur_dioxide.value,
      total_sulfur_dioxide: total_sulfur_dioxide.value,
      density: density.value,
      pH: pH.value,
      sulphates: sulphates.value,
      alcohol: alcohol.value,
      type_red: red_wine.value,
      type_white: white_wine.value
  };

  fetch(`/data_input`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(entry),
    cache: "no-cache",
    headers: new Headers({
      "content-type": "application/json"
    })
  })
    .then(function (response) {
      if (response.status !== 200) {
        console.log(`Looks like there was a problem. Status code: ${response.status}`);
        return;
      }
      response.json().then(function (data) {
        console.log(data);
        document.getElementById("rating").innerText=data.result
      });
    })
    .catch(function (error) {
      console.log("Fetch error: " + error);
    });
}


async function main() {
  //load wine list from flask route that calls database
  let response = await fetch('/wine_list');
  let data = await response.json();

  //populate drop-down with sample ID names
  for (i=0; i<data.length; i++) {
      //set create methods as variables (have to do this inside the loop)
      const newOption = document.createElement('option');
      const attributeVal = document.createAttribute('value');
      
      //set display text and value to sample id name
      newOption.textContent = data[i];
      attributeVal.value = data[i];
      
      //add newOption
      document.querySelector("#selDataset").append(newOption);
      //add value attribute 
      newOption.setAttributeNode(attributeVal);
  }; 
  
  //initial page load with first item in list
  wineChange("Famille Hugel, Gewurztraminer Classic");
};

//call main function for initial page load
main();



async function wineChange(wine) {
  //load info from flask route that calls database
  const response = await fetch(`/${wine}`); 
  const data = await response.json();
 
  // create list of info for table
  let panel_info = [data.cultivar, data.region, data.vintage, data.alcohol, data.residual_sugar, data.LR_predict, data.RF_predict]
   

  //remove old info
  let oldInfo = document.querySelectorAll('#wineInfo');
  for (let i=0;i<oldInfo.length;i++) {
      oldInfo[i].textContent = '';
  };

  //load current info
  let counter = 0
  Array.from(document.querySelectorAll('td'))
      .forEach(td => {
          td.textContent = panel_info[counter]
          td.id = 'wineInfo'
          counter += 1    
  });

};

