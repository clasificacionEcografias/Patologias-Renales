var modelo = null;
var modeloD = null
var imageArray = null; 
var imageArray3 = null;
const { jsPDF } = window.jspdf;
            
//const pdf = new jsPDF();
const recomend = document.getElementById('recomend');

(async() => {
    // Modelo de diagnostico
    console.log("Cargando modelo principal...");
    modelo = await tf.loadLayersModel("model.json");
    console.log("Modelo principal cargado");

    //Modelo de diferencia
    console.log("Cargando modelo diferenciador...");
    modeloD = await tf.loadLayersModel("modelD1.json");
    console.log("ModeloD cargado");

})();

function imprimirDiagnostico() {
    const pdf = new jsPDF();
    // Crear un nuevo objeto jsPDF
    pdf.setFont('courier');

    // Agregar texto al PDF
    pdf.text("NIUVET Clínica Veterinaria", 20, 20)
    pdf.text("DIAGNÓSTICO: "+document.getElementById('diagnostico').innerHTML, 20, 40);

    var recomd = recomend.innerHTML
    recomd = recomd.replace(/<br>/g, '\n').replace(/<\/?b>/g, '').split('\n');
    pdf.setFontSize(11);

    var y = 60

    for (let i = 0; i < recomd.length; i++) {
        if (recomd[i].length>70){
            pdf.text(recomd[i].substring(0,70), 20, y);
            y = y + 8
            var substr = recomd[i].substring(70,200)
            if (substr.length>70){
                pdf.text(substr.substring(0,70), 20, y);
                y = y + 8
                pdf.text(substr.substring(70,200), 20, y);
            } else {
                pdf.text(substr, 20, y);
            }
        } else {
            pdf.text(recomd[i], 20, y);
        }

        y = y + 8
    }

    // Obtener la imagen desde el canvas en formato base64
    const canvas = document.getElementById('canvas');
    const imageUrl = canvas.toDataURL(); // Esto devuelve la imagen en formato base64

    // Agregar la imagen al PDF
    pdf.addImage(imageUrl, 'JPEG', 20, y + 10, 120, 80); // (url, tipo, x, y, ancho, alto)

    // Guardar el PDF como un archivo
    pdf.save('diagnostico.pdf');
  }

function handleImage(e) {
    const input = e.target;
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        recomend.innerHTML = ""
        recomend.style.width = "0px"
        document.getElementById('lab_desc').style.display = "none"

        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;

            img.onload = function () {
                const canvas = document.getElementById('canvas');
                const ctx = canvas.getContext('2d');

                // Escalar la imagen a 180x180
                const scaledWidth = 180;
                const scaledHeight = 180;
                canvas.width = scaledWidth;
                canvas.height = scaledHeight;

                ctx.clearRect(0, 0, scaledWidth, scaledHeight);

                ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

                // Obtener los datos de la imagen como arreglo
                const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight).data;

                // Convertir los datos de la imagen a un arreglo tridimensional (180x180x3)
                imageArray = new Array(scaledHeight).fill(null).map(() => new Array(scaledWidth).fill(null).map(() => new Array(1).fill(0)));
                imageArray3 = new Array(scaledHeight).fill(null).map(() => new Array(scaledWidth).fill(null).map(() => new Array(3).fill(0)));
                for (let i = 0; i < scaledWidth * scaledHeight * 4; i += 4) {
                    const x = (i / 4) % scaledWidth;
                    const y = Math.floor((i / 4) / scaledWidth);
                
                    // Calcular el promedio de los tres canales de color
                    const avgColor = (imageData[i] + imageData[i + 1] + imageData[i + 2]) / (3);
                
                    // Asignar el valor promedio al único canal en imageArray
                    imageArray[y][x][0] = avgColor;
                    imageArray3[y][x][0] = imageData[i]
                    imageArray3[y][x][1] = imageData[i+1]
                    imageArray3[y][x][2] = imageData[i+2]
                }

                //console.log(imageArray)

                document.getElementById('lab_img').innerHTML = "CAMBIAR IMAGEN"

                //console.log(imageArray);

                if (modeloD != null){
                    var tensorD = tf.tensor4d([imageArray3]);
                    var resultadoD = modeloD.predict(tensorD).dataSync();
                    console.log(resultadoD[0])
                    //var maximoD = Math.max(...resultadoD);
                    //const indiceMaximoD = resultadoD.indexOf(maximoD);
                    //console.log(indiceMaximoD)

                    if (modelo != null && resultadoD[0]>0.5){

                        var tensor = tf.tensor4d([imageArray]);
                        var resultado = modelo.predict(tensor).dataSync();
                        console.log(resultado)
                        var maximo= Math.max(...resultado);
                        // console.log(maximo)

                        // Obtenemos el índice del valor máximo usando indexOf
                        const indiceMaximo = resultado.indexOf(maximo);
                        //console.log(indiceMaximo)

                        if (indiceMaximo==2){
                            document.getElementById('diagnostico').innerHTML = "Cálculos renales"
                            recomend.innerHTML = "<b>Acciones y Tratamientos Sugeridos:</b><br>1. Modificaciones Dietéticas: Se puede ajustar la dieta del perro para prevenir la formación de cálculos y promover su eliminación.<br>2. Hidratación Adecuada: Incrementar la ingesta de agua es esencial para facilitar la expulsión de los cálculos y mejorar la función renal.<br>3. Tratamiento Farmacológico: Se pueden administrar medicamentos específicos diseñados para disolver o reducir el tamaño de los cálculos.<br>4. Intervención Quirúrgica: En situaciones más graves o cuando otras opciones no son efectivas, se puede considerar la cirugía como último recurso."
                        
                        } else if (indiceMaximo==1){
                            document.getElementById('diagnostico').innerHTML = "Nefropatía de aspecto crónico"
                            recomend.innerHTML = "<b>Acciones y Tratamientos Recomendados:</b><br>1. Control Farmacológico: La administración de fármacos dirigidos a regular la presión arterial puede ser esencial para mitigar el avance de la enfermedad.<br>2. Dieta Específica: Una alimentación controlada en proteínas puede ayudar a reducir la carga renal y minimizar el deterioro adicional.<br>3. Hidratación Optimizada: Mantener una hidratación adecuada es fundamental para apoyar la función renal y prevenir complicaciones.<br>4. Gestión de Enfermedades Subyacentes: Tratar cualquier otra condición médica presente que pueda contribuir o exacerbar la nefropatía.<br>5. Terapia Renal de Apoyo: La terapia, como la infusión de líquidos intravenosos, puede ser necesaria para mantener la función renal."
                        
                        } else {
                            document.getElementById('diagnostico').innerHTML = "Riñones sanos"
                            recomend.innerHTML = "<b>Estrategias Preventivas y Cuidados Renales:</b>"+
                            "<br>Para preservar la funcionalidad y salud renal en caninos, es vital implementar las siguientes prácticas:"+
                            "<br>1.Nutrición Balanceada: Proporcionar una dieta equilibrada y adecuada para fortalecer el sistema renal."+
                            "<br>2.Hidratación Constante: Asegurar un suministro constante de agua fresca para mantener una hidratación óptima."+
                            "<br>3.Actividad Física Regular: Fomentar el ejercicio regular para promover la salud general y renal."+
                            "<br>4.Ambiente Libre de Toxinas: Evitar exposiciones a sustancias nocivas que puedan comprometer la función renal."+
                            "<br>5.Consultas Veterinarias Periódicas: Realizar revisiones veterinarias rutinarias para detectar cualquier anomalía a tiempo."+
                            "<br>6.Seguir Recomendaciones Especializadas: Acatar las directrices y prescripciones veterinarias específicas para cada caso canino."
                        
                        }

                        document.getElementById('lab_desc').style.display = "block"

                        recomend.style.width = "400px"

                        //console.log(indiceMaximo)
                    } else {
                        document.getElementById('diagnostico').innerHTML = "IMAGEN NO VÁLIDA"
                    }
                } 
            };
        };

        reader.readAsDataURL(input.files[0]);
    }

    return imageArray
}

document.getElementById('imagenInput').addEventListener('change', handleImage);
document.getElementById('descargar').addEventListener('click', imprimirDiagnostico);
