require('colors');
require('dotenv').config()

const { inquirerMenu, 
        pausa, 
        leerInput,
        listarLugares} = require('./helpers/inquirer');
const Busquedas = require('./models/busquedas');

const main = async () => {

    const busquedas = new Busquedas();
    let opt;
    
    do {
        
        opt = await inquirerMenu();
           // console.log({opt});

        switch (opt) {
            
            case 1:
                //Mostrar mensaje
                const termino = await leerInput('Ciudad:');
                
                //Buscar los lugares
                const lugares = await busquedas.ciudad(termino);
                
                //Seleccionar el lugar
                const id = await listarLugares(lugares);
                if(id === '0') continue;

                const lugarSel = lugares.find(l => l.id === id);
                //Guardar en DB
                busquedas.agregarHistorial(lugarSel.nombre);

                //Clima
                const clima = await busquedas.climaLugar(lugarSel.lat, lugarSel.lng);

                //Mostrar resultados.
                console.clear();
                console.log('\nInformacion de la ciudad\n'.blue);
                console.log('Ciudad: ', lugarSel.nombre.yellow);
                console.log('Lat: ', lugarSel.lat);
                console.log('Lng: ', lugarSel.lng);
                console.log('Temperatura:', clima.temp,'°C'.yellow);
                console.log('Minima:', clima.min,'°C'.yellow);
                console.log('Máxima:', clima.max,'°C'.yellow);
                console.log('Como esta el clima:', clima.desc.yellow);

            break;

            case 2: // Listar historial

                    busquedas.historialCapitalizado.forEach((lugar, i)=>{
                    //busquedas.historial.forEach((lugar, i)=>{
                    const idx = `${i + 1}.`.blue;
                    console.log(`${idx} ${lugar}`);  
                })

            break;
        }
        
        if (opt !== 0) await pausa();

    } while (opt !== 0);
}

main();