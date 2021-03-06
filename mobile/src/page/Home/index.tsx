import React,{useState,useEffect} from 'react';
import {View,Image,StyleSheet,Text,ImageBackground,KeyboardAvoidingView} from 'react-native';
import {RectButton} from 'react-native-gesture-handler';
import {Feather as Icon} from '@expo/vector-icons';
import { useNavigation,useRoute } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select'; 
import axios from 'axios';



const Home = () =>{
  const navigation = useNavigation();
  const [uf, setUfs] =  useState<uf[]>([]);
  const [city, setCities] = useState<city[]>([]);
  const [ selectedCity, setSelectedCity ] = useState<string>( '0' );
  const [selectedUf,setSelectedUf] = useState('0');



  
interface IBGEUFResponse{
  sigla: string
}

interface uf{
  
    label:string,
    value:string
  
}



interface city{
  
  label:string,
  value:string

}



interface IBGECityResponse{
  nome: string
}


  useEffect( ()=>{
        
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res =>{
        const ufInitial = res.data.map(uf => ({label:uf.sigla,value:uf.sigla}));
         //console.log(ufInitial);
        setUfs(ufInitial);
    });
},[]);


useEffect( ()=>{
  if(selectedUf === '0'){
      return;
  }else
  axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(res =>{
      const cityNames = res.data.map(city => ({label:city.nome,value:city.nome}));
      
      setCities(cityNames);
  });
},[selectedUf]);


  
 function handleSelectedUfs(uf:string){
  setSelectedUf(uf);   
}


 function handleSelectedCity(city:string){
  setSelectedCity(city)
 }


  function handleNavigationToPoints(){
    navigation.navigate('Points',{uf:selectedUf,city:selectedCity});
  }
    return (

        <ImageBackground source={require('../../assets/home-background.png')} style={styles.container} imageStyle={{width:274,height:368}}>
          <View style={styles.main}>
            <Image source={require('../../assets/logo.png')} />
            <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
            <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
            
          </View>
          
           <View style={styles.footer}>
           
        <RNPickerSelect placeholder={{ label: `Selecione um estado UF`,
                                         value: null,
                                         color: '#9EA0A4',}}
            onValueChange={(value) => {handleSelectedUfs(value)}}  style={{
              inputAndroid: {
                backgroundColor: 'white',
                
                fontFamily:'Roboto_400Regular',
                marginBottom:5,
                
                

            },iconContainer: {backgroundColor:'white'}
          }}
          items={uf}
            Icon={() => {
              return <Icon name="arrow-down" size={25} color="gray" style={{backgroundColor:'white', marginTop:15}} />;
            }}

        />
        <RNPickerSelect placeholder={{ label: `Selecione uma cidade`,
                                         value: null,
                                         color: '#9EA0A4',}}
            onValueChange={(value) => {handleSelectedCity(value)}}  style={{
              inputAndroid: {
                backgroundColor: 'white',
                
                fontFamily:'Roboto_400Regular',
                

            },iconContainer: {backgroundColor:'white'}
          }}
            items={city}
            Icon={() => {
              return <Icon name="arrow-down" size={25} color="gray" style={{backgroundColor:'white', marginTop:15}} />;
            }}

        />
             <RectButton style={styles.button} onPress={handleNavigationToPoints}> 
              <View style={styles.buttonIcon}>
                <Text> 
                  <Icon name="arrow-right" color="#FFF" size={25}/>
                </Text>
              </View>
              <Text style={styles.buttonText}>  Entrar</Text>
             </RectButton>
            </View>
       </ImageBackground>
    
    );
};


const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 32,
     
    },
  
    main: {
      flex: 1,
      justifyContent: 'center',
    },
  
    title: {
      color: '#322153',
      fontSize: 32,
      fontFamily: 'Ubuntu_700Bold',
      maxWidth: 260,
      marginTop: 64,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 16,
      fontFamily: 'Roboto_400Regular',
      maxWidth: 260,
      lineHeight: 24,
    },
  
    footer: {},
  
    select: {},
  
    input: {
      height: 60,
      backgroundColor: '#FFF',
      borderRadius: 10,
      marginBottom: 8,
      paddingHorizontal: 24,
      fontSize: 16,
    },
  
    button: {
      backgroundColor: '#34CB79',
      height: 60,
      flexDirection: 'row',
      borderRadius: 10,
      overflow: 'hidden',
      alignItems: 'center',
      marginTop: 8,
    },
  
    buttonIcon: {
      height: 60,
      width: 60,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
    },
  
    buttonText: {
      flex: 1,
      justifyContent: 'center',
      textAlign: 'center',
      color: '#FFF',
      fontFamily: 'Roboto_500Medium',
      fontSize: 16,
    },

  });

  
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 106,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});





export default Home