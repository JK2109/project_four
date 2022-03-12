# Import libraries
import numpy as np
from flask import Flask, request, jsonify, render_template, redirect
import pickle
import numpy as np


import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

#connect to database
engine = create_engine("sqlite:///wine_data.sqlite")

#reflect table as class and save reference
Base = automap_base()
Base.prepare(engine, reflect=True)
winelist = Base.classes.wine_table 

# Create an instance of Flask
app = Flask(__name__)

# Load the model
model = pickle.load(open('model.pkl','rb'))
scaler = pickle.load(open('scale.pkl','rb'))

# Load the model for sample prediction
LR_model = pickle.load(open('LR_model.pkl','rb'))
RF_model = pickle.load(open('RF_model.pkl','rb'))
LR_RF_scaler = pickle.load(open('LR_RF_scaler.pkl','rb'))


# Root Route
@app.route('/')
def home():
    return render_template('index.html')

# Route that will trigger the input of data
@app.route('/data_input', methods=["GET", "POST"])
def data_input():
    req = request.get_json()
    
    #test dataset
    # X = [[9.1,0.27,0.45,10.6,0.035,28,124,0.997,3.2,0.46,10.4,1,0]]
    
    X=[[float(req['fixed_acidity']),float(req['volatile_acidity']),float(req['citric_acid']),float(req['residual_sugar']),float(req['chlorides']),float(req['free_sulfur_dioxide']),float(req['total_sulfur_dioxide']),float(req['density']),float(req['pH']),float(req['sulphates']),float(req['alcohol']),float(req['type_red']),float(req['type_white'])]]
    print(X)

    X_scaled = scaler.transform(X)
    prediction = model.predict(X_scaled)
    prediction = {'result': int(prediction[0])}
    
    return jsonify(prediction)
    

#to populate dropdown
@app.route('/wine_list')
def wine_list():
    session = Session(engine)
    results = session.query(winelist.product_name).all()
    session.close()

    #wine list as array
    total_wine_list = list(np.ravel(results))

    return jsonify(total_wine_list)  


@app.route("/<wine>", methods=["GET", "POST"])
def by_wine(wine):
    session = Session(engine)
    results = session.query(winelist).filter(winelist.product_name == wine).first()
    session.close()


    X_sample = [[results.residual_sugar, results.alcohol]]

    X_scaled = LR_RF_scaler.transform(X_sample)
    LR_predict = LR_model.predict(X_scaled)
    RF_predict = RF_model.predict(X_scaled)
   
    #Convert the query results to a dictionary  
    dict = {
        "id": results.id,
        "product_name": results.product_name,
        "cultivar": results.cultivar,
        "region": results.region,
        "vintage": results.vintage,
        "alcohol": results.alcohol,
        "residual_sugar":results.residual_sugar,
        "LR_predict":int(LR_predict[0]),
        "RF_predict":int(RF_predict[0])
    }
    print (dict)
    print(jsonify(dict))
    
    return jsonify(dict)


if __name__ == "__main__":
    app.run(debug=True)