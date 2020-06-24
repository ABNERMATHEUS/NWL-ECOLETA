import React,{useEffect, useState, ChangeEvent,FormEvent} from 'react';
import './style.css';
import {Link, useHistory} from 'react-router-dom';
import logo from '../../assets/logo.svg'
import {FiArrowLeft} from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet';
import {LeafletMouseEvent} from 'leaflet';
import api from '../../services/api';
import axios from 'axios';
import Dropzone from '../../components/Dropzone';


//sempre quando a gente criar uma array ou objeto: manualmente informar o tipo da variável

interface Item{
    id:number;
    title:string;
    image_url:string;
}


interface IBGEUFResponse{
    sigla: string
}


interface IBGECityResponse{
    nome: string
}

const CreatePoint = () => {
    const [selectedFile, setSelectedFile] = useState<File>();
    const history = useHistory();
    const [items, setItems] = useState<Array <Item> >([]); //ou const [items, setItems] = useState<Item[]>([]); com esse conchetes ao inves de array
    const [ufs, setUfs] = useState<string[]>([]);
    const [selectedUf,setSelectedUf] = useState('0');
    const [cities, setCities] = useState<string[]>([]);
    const [ selectedCity, setSelectedCity ] = useState<string>( '0' )
    const [selectedPosition, setSelectedPosition] = useState<[number,number]>([0,0]);
    const [inicialPosition, setInicialPosition] = useState<[number,number]>([0,0]);
    const [selectItems,setSelectedItems] = useState<number[]>([]);
    const [formData,setFormData] = useState({
        name:'',
        email:'',
        whatsapp:'',
    });
    

    useEffect(()=>{
        api.get('items').then(res =>{
            setItems(res.data);
        })
    }, [] ); 

    useEffect( ()=>{
        
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res =>{
            const ufInitial = res.data.map(uf => uf.sigla);
            setUfs(ufInitial);
        });
    },[]);


    
    useEffect( ()=>{
        if(selectedUf === '0'){
            return;
        }else
        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(res =>{
            const cityNames = res.data.map(city => city.nome);
            
            setCities(cityNames);
        });
    },[selectedUf]);


    useEffect( ()=>{
        navigator.geolocation.getCurrentPosition(position =>{
            const {latitude,longitude} = position.coords;
            setInicialPosition([latitude,longitude]);
        })
    },[])

    function handleSelectUf(event:ChangeEvent <HTMLSelectElement> ){
        const uf = event.target.value;
        setSelectedUf(uf);
     
    }

    function handleSelectCity(event:ChangeEvent <HTMLSelectElement>){
        const city = event.target.value;
        setSelectedCity(city)
    }

    function handleMapClick(event: LeafletMouseEvent){
        setSelectedPosition([event.latlng.lat,event.latlng.lng]);

    }

    function handleInputChange(event: ChangeEvent <HTMLInputElement>){
       // console.log(event.target.name + event.target.value)
        const {name,value} = event.target;
       setFormData({ ...formData,[name]: value });
       
    }

    function HandleSelectedItem(id:number){
        const alreadySelected = selectItems.findIndex(item => item === id);
        if(alreadySelected>=0){
            const filteredItems = selectItems.filter(items => items !== id);
            setSelectedItems(filteredItems);
        }else{
            setSelectedItems([...selectItems , id] );
        }
        
    }

    async function HandleSubmit (event:FormEvent ){
        
        
        event.preventDefault();
        const {name,email,whatsapp} = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude,longitude]= selectedPosition;
        const items = selectItems;
        const data = new FormData();
        data.append('name',name);
        data.append('email',email);
        data.append('whatsapp',whatsapp);
        data.append('uf',uf);
        data.append('city',city);
        data.append('latitude',String(latitude));
        data.append('longitude',String(longitude));
        data.append('items',items.join(','));
        if(selectedFile){
            data.append('image',selectedFile)
        };
        

        await api.post('points',data);
        alert('Ponto de coleta criado !');
        history.push('/');
    
    }

    //Se eu deixar o [] vazio será executado uma única vez
    return(
        <div id="page-create-point">
            <header>
               <img src={logo} alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={HandleSubmit}>

                <h1>Cadastro do <br/> ponto de coleta</h1>
                <Dropzone onFileUploaded={setSelectedFile}/>
                

                <fieldset>
                    <legend><h2>Dados</h2></legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" id="name" name="name" onChange={handleInputChange}/>
                    </div>

                    <div className="field-group">
                    <div className="field">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" onChange={handleInputChange}/>
                    </div>
                    <div className="field">
                        <label htmlFor="name">Whatsapp</label>
                        <input type="text" id="whatsapp" name="whatsapp" onChange={handleInputChange}/>
                    </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                        </legend>
                </fieldset>

                <Map center={[ -25.5459926,-49.2942842]} zoom={1} onclick={handleMapClick}>
                    <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={selectedPosition}/>
                </Map>

                <div className="field-group">
                    <div className="field">
                        <label htmlFor="uf">Estado (UF) </label>
                        <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
                            <option value="0">Selecione uma uf</option>
                            {ufs.map(uf => (
                                <option key={uf} value={uf}>{uf}</option>
                            ))}
                        </select>

                    </div>
                    <div className="field">
                        <label htmlFor="city">Cidade</label>
                        <select name="city" id="city" value={selectedCity} onChange={handleSelectCity} >
                            <option value="0">Selecione uma cidade</option>
                            {cities.map(city =>(
                                    <option key={city} value={city}> {city}</option>
                            ))}
                        </select>

                    </div>
                </div>

                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Selecione um ou mais itens abaixos</span>
                        </legend>

                        <ul className="items-grid">
                            {items.map(items=>  (
                                <li key={items.id} onClick={ ()=> HandleSelectedItem(items.id)} className={
                                    selectItems.includes(items.id)?'selected': ''
                                }>
                                <img src={items.image_url} alt="Teste"/>
                            <span>{items.title}</span>
                                </li>

                            ))}
                           
                        </ul>
                </fieldset>

                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    )
};

export default CreatePoint;