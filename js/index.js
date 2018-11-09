var ecuacionGlobal = "";

window.onload = function() {

    document.querySelector(".delete").addEventListener("click", function(){
        document.getElementById("alerta").style.display = "none";
    }, false);

    document.getElementById("btnCalc").addEventListener("click", validarCampos, false);

    let parametros = ["xMin", "xMax", "yMin", "yMax"];
    for (let i = 0; i < parametros.length; i++) { 
        document.getElementById(parametros[i]).addEventListener("input",  function(){
            plot();
        }, false);
    }
};


/*
function simpson13(n, a, b, f){
    //calculamos h
    h = (b - a) / n
    //Inicializamos nuestra varible donde se almacenara las sumas
    suma = 0.0
    //hacemos un ciclo para ir sumando las areas
    for (var i = 1; i < n; i++) {
        //calculamos la x
        //x = a - h + (2 * h * i)
        x = a + i * h
        // si es par se multiplica por 4
        if(i % 2 == 0)
            suma = suma + 2 * fx(x, f);
        //en caso contrario se multiplica por 2
        else
            suma = suma + 4 * fx(x, f);    



    }
         //sumamos los el primer elemento y el ultimo
        suma = suma + fx(a, f) + fx(b, f);
        //Multiplicamos por h/3
        rest = suma * (h / 3);
    //Retornamos el resultado
    return (rest); 

}

function fx(x, f){
    var retorno = eval('('+f+')');
     return retorno;
}

*/


/**
 * Esta función se encarga de validar los campos antes de ser procesados
 * @return {void}
 */
function validarCampos()
{
    document.getElementById("msjAlerta").innerHTML = "";

    let inferior = document.getElementById("inferior"); 
    let superior = document.getElementById("superior"); 
    let iteracion = document.getElementById("iteracion");  
    let ecuacion = document.getElementById("ecuacion");  
    let metodo = document.getElementById("metodo").value; 

    var campo = [inferior, superior, iteracion, ecuacion],
        requerido = false;

    for (let i = 0; i < campo.length; i++) {
        if(campo[i].value == ""){
            campo[i].classList.add("is-danger"); requerido = true;
        }else{
            campo[i].classList.remove("is-danger");
        }
    }
 
    if(requerido){
        document.getElementById("msjAlerta").innerHTML = "Debe ingresar los campos requeridos";
        document.getElementById("alerta").style.display = "";
        return;
    } 

    if(Number(inferior.value) >= Number(superior.value)){
        document.getElementById("msjAlerta").innerHTML = "El limite inferior debe ser menor al limite superior";
        document.getElementById("alerta").style.display = "";
        return;
    }

    if(Number(iteracion.value) <= 0){ 
        document.getElementById("msjAlerta").innerHTML = "Las iteraciones 'n' deben ser mayores a cero";
        document.getElementById("alerta").style.display = "";
        return;            
    }  
 
    if(Number(iteracion.value) >= 10000){ 
        document.getElementById("msjAlerta").innerHTML = "Las iteraciones 'n' son muy grandes, no hay capacidad suficiente para ejecutar las iteraciones";
        document.getElementById("alerta").style.display = "";
        return;            
    }      
  
 //En 1/3, la n debe ser par
    document.getElementById("alerta").style.display = "none";    
    calcularEcuacion(metodo); 
}

/**
 * Esta función se encarga de calcular la ecuación
 * @param  {string} metodo
 * @return {void}
 */
function calcularEcuacion(metodo)
{ 
    try {
        ecuacionGlobal = adecuarEcuacion(); 
        var a = Number(document.getElementById("inferior").value);
        var b = Number(document.getElementById("superior").value);
        var n = Number(document.getElementById("iteracion").value);
        var h = (b-a) / n;
        var suma = 0;
        //var error = Number.parseFloat((Math.pow((b-a), 4)) / (180 * Math.pow(n, 4))).toFixed(5);
        var error = 0, array = [];
     
        for (let i = 0; i < n; i++) {

            b=a+h;

            if(metodo == "1_3"){
                var area = simpson13(a,b);
            }else{
                var area = simpson38(a,b);
            } 
            suma=suma+area;
            array.push(suma);//console.log(suma)
            a=b;
        }
//0.7131356265236113
//1.6603991088918013
//2.95788101673923
        var errorEA  = 0;
        for (let i = 1; i < n; i++) {
            var errorAnt = array[i-1];
            
              errorEA = Math.abs(((array[i] - errorAnt) / array[i]) * 100);
           console.log(errorEA)
            // console.log(array[i]+" - "+errorAnt+" / "+array[i])
        }


        plot(suma);
        ecuacionGlobal = "";
        document.getElementById("resultado").innerHTML = "El resultado aproximado es "+suma;  
        document.getElementById("errorResultado").innerHTML = "El error retornado por la ecuación es "+errorEA;
        document.getElementById("grafico").style.display = "";
    }
    catch(err) {
        let mensajeError = (err.name == "ReferenceError" ? "La función no existe" : "Hay un error en su función, por favor revísela");
        document.getElementById("resultado").innerHTML = mensajeError;   
        document.getElementById("errorResultado").innerHTML = "";
        document.getElementById("grafico").style.display = "none";
    }    
}


/**
 * Esta función se encarga adecuar la ecuación para javascript, agregando la expresión Math.
 * @return {string} b - Bar
 */
function adecuarEcuacion()
{
    var ecuacion = (document.getElementById("ecuacion").value).trim();  
    var expresion = ["cbrt","cos", "exp", "sin", "log", "pow", "sqrt", "tan", "PI"];

    for (let i = 0; i < expresion.length; i++) {
        
        var indices = getIndicesOf(expresion[i], ecuacion); 
        var ocurrencias = indices.length;

        if(ocurrencias > 0){

            ecuacion = ecuacion.slice(0, indices[0]) + "Math." + ecuacion.slice(indices[0]);
            
            if(ocurrencias > 1){ 

                for (let x = 1; x < ocurrencias; x++) {

                    indices = getIndicesOf(expresion[i], ecuacion); 
                    console.log(indices[x])
                    ecuacion = ecuacion.slice(0, indices[x]) + "Math." + ecuacion.slice(indices[x]);
                }            
            }          
        }

        /*
        if(ecuacion.indexOf(expresion[i]) != -1){
           ecuacion = ecuacion.slice(0, ecuacion.indexOf(expresion[i])) + "Math." + ecuacion.slice(ecuacion.indexOf(expresion[i]));
        }*/
    } 

    return ecuacion;
}

function getIndicesOf(searchStr, str, caseSensitive) {
    var searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
        return [];
    }
    var startIndex = 0, index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}

function formula(){
    //var f = 'Math.sqrt(1+(x*x))';
    var f = 'Math.sqrt(1+(x*x))';
    return f;
}

/**
 * Este método ejecuta la función con valores numéricos
 * 
 * @param  {float} x  Valor a reemplazar en la función global
 * 
 * @return {float} Retorna la función convertida
 */
function fx(x){ 
    var retorno = eval('('+ecuacionGlobal+')');
    return retorno;
}

/**
 * Esta función ejecuta el método simpson 1/3
 * 
 * @param  {decimal} a Limite inferior
 * @param  {decimal} b Limite superior
 * 
 * @return {decimal} integral Retorna el resultado de la iteración
 */
function simpson13(a,b)
{  
    var m=(a+b)/2;
    var integral = (b-a) / 6 * (fx(a) + 4 * fx(m) + fx(b));
    return integral; 
}



function lectira(){
    var a=0;
    var b=2;
    var n=4; //debe ser par
    var h= (b-a) / n;
    var suma=0;
    var error = Number.parseFloat((Math.pow((b-a), 4)) / (180 * Math.pow(n, 4))).toFixed(5);;

    for (var i = 0; i < n; i++) {
        b=a+h;
        var area=simpson13(a,b);
        suma=suma+area;
        a=b;
    }

    
    console.log(suma)
    console.log(error)
}

//console.log(lectira())



function formula(){
    var f = 'Math.sqrt(1+(x*x))';
    return f;
}

/*
function fx(x){
    var retorno = eval('('+formula()+')');
    //var retorno = Math.sqrt(1+(x*x));
     return retorno;
}*/

/**
 * Esta función ejecuta el método simpson 3/8
 * 
 * @param  {decimal} a Limite inferior
 * @param  {decimal} b Limite superior
 * 
 * @return {decimal} integral Retorna el resultado de la iteración
 */
function simpson38(a,b)
{
    var m1 = (2 * a + b) / 3;
    var m2 = (a + 2 * b) / 3;
    var integral = (b-a) / 8 * (fx(a) + 3 * fx(m1) + 3 * fx(m2) + fx(b));
    return integral; 
}
 

function lectira2(){
    var a=0;
    var b=2;
    var n=4; //debe ser par
    var h= (b-a) / n;
    var suma=0;
    var error = Number.parseFloat((Math.pow((b-a), 4)) / (180 * Math.pow(n, 4))).toFixed(5);

    for (var i = 0; i < n; i++) {
        b=a+h;
        var area=simpson38(a,b);
        suma=suma+area;
        a=b;
    }

    console.log(suma)
    var vt = Math.exp(Math.PI) / 2 + 1 / 2;
    var errorporcentual = Math.abs((vt - suma) / vt) * 100;
    console.log(errorporcentual)
}

//console.log(lectira2())



/**
 * Esta función se encarga de graficar la ecuación
 * @param  {String} resultado Resultado de la ecuación
 * @return {void}  
 */
function plot(resultado = "") {
 
  var ecuacion = (document.getElementById("ecuacion").value).trim();  
  var xMin = document.querySelector("#xMin").value;
  var xMax = document.querySelector("#xMax").value;
  var yMin = document.querySelector("#yMin").value;
  var yMax = document.querySelector("#yMax").value;
  var a = Number(document.getElementById("inferior").value);
  var b = Number(document.getElementById("superior").value);


    var parameters = {
      target: '#myFunction',
      data: [{
        color: '#d9b2c5',
        closed: true,
        graphType: 'polyline'
     }],
      grid: true,
      yAxis: {domain: [0, 5]},
      xAxis: {domain: [0, 5]}
    };
 
  parameters.data[0].fn = ecuacion;
  parameters.data[0].range = [a, b]; 
  parameters.xAxis.domain = [xMin, xMax];
  
  if(resultado == ""){
    parameters.yAxis.domain = [yMin, yMax]; 
  }else{
    parameters.yAxis.domain = [yMin, (Number(resultado) < 5 ? (Number(resultado) < 3 ? 3: 5) : Number(resultado))];  
  }
  
  functionPlot(parameters);
}




 //#valores de ejemplo para la funcion sin(x) con intervalos de
/*var n = "3";
var a = "0";
var b = "2";
var f = 'Math.sqrt(1+(x*x))';
 
console.log(simpson13(n, a, b, f))*/
