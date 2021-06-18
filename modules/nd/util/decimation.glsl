// #define decimation(value, presicion) (floor(value * presicion)/presicion)

// Simplify the value by the given factor
// see https://graphtoy.com/?f1(x,t)=x&v1=true&f2(x,t)=floor(x%20*%205.0)/5.0&v2=false&f3(x,t)=floor(x%20*%2020.0)/20.0&v3=false&f4(x,t)=floor(x%20*%20256.0)/256.0&v4=false&f5(x,t)=&v5=false&f6(x,t)=&v6=false&grid=true&coords=0.5,0.5,0.6666666666666666
float decimation(float value, float factor) {
    return floor(value * factor) / factor;
}