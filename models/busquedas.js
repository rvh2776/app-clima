const fs = require('fs');
const axios = require('axios');

class Busquedas {

    historial = [];
    dbPath = './db/database.json';

    constructor(){
        this.leerDB();
    }

    get historialCapitalizado(){

        return this.historial.map(lugar => {
            let palabras = lugar.split(' ');
            palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1));

            return palabras.join(' ');
        })
    }

    get paramsMapBox(){
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get paramsWeather(){
        return{
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        }
    }

    async ciudad(lugar = ''){
        
        try {
            // Peticion http.
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapBox
            });

            const resp = await instance.get();
            
            return resp.data.features.map(lugar => ({ // ojo aca estoy retornando un objeto de forma implicita
                                                      // eso son los parentesis antes de abrir las llaves.
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }));

        } catch (error) {
            return [];
        }
    }

    async climaLugar(lat, lon){
        try {
            // instance axiox.
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}`,
                
    // params: {...this.paramsWeather, lat, lon} Asi no pondria: ?lat=${lat}&lon=${lon} en el baseURL
                params: this.paramsWeather
            });

            const resp = await instance.get();
            const {weather} = resp.data;

            return{
                desc: weather[0].description, // weather viene como objeto dentro de un arreglo,
                                              // por eso los parentesis rectos eligiendo una posicion.
                min: resp.data.main.temp_min,
                max: resp.data.main.temp_max,
                temp: resp.data.main.temp
            }

        } catch (error) {
           console.log(error); 
        }
    }

    agregarHistorial(lugar = ''){
        // prevenir duplicados.
        if (this.historial.includes(lugar.toLocaleLowerCase())){
            return;
        }
        // Maximo guarda 6 lugares en el historial.
        this.historial = this.historial.splice(0,5);

        this.historial.unshift(lugar.toLocaleLowerCase());

        // Grabar en Db.
        this.guardarDB();
    }

    guardarDB(){
        const payload = {
            historial: this.historial
        };
        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    leerDB(){
        // Debe de existir...
        if (!fs.existsSync(this.dbPath)){
            return null;
        }

        const info = fs.readFileSync(this.dbPath, {encoding: 'utf-8'});
        const data = JSON.parse(info);
        
        this.historial = data.historial;
    }
}

module.exports = Busquedas;