import {Request, Response, request} from 'express';
import knex from '../database/connection';

class pointsController {

    async create (req: Request,res: Response) {

        const { name, email, whatsapp, latitude, longitude, city, uf, items } = req.body;
        const points = { image: req.file.filename
                        , name
                        , email
                        , whatsapp
                        , latitude
                        , longitude
                        , city
                        , uf };

        const trx = await knex.transaction();

        const insertedIds = await trx('points').insert(points); //quando é inserido sempre retorna o id
        
        const point_id = insertedIds[0]

        const  pointsItems = items
        .split(',')
        .map((item:string)=>Number(item.trim()))
        .map((item_id: number)=>{
            return {
                item_id,
                point_id:insertedIds[0]
            }
        });

        await trx('items_points').insert(pointsItems);


        trx.commit();
        
        return res.json({
            id:point_id,
            ...points,  // OS TRÊS PONTOS QUER DIZER TODO os elemento do json do points
        });
    }

    async show (req: Request, res: Response){
        const {id} = req.params;

        const point = await knex('points').where('id',id).first();
        if(!point){
            res.status(400).json({message:'Point not found'});
        }

        const items = await knex('items')
                        .join('items_points','items.id','=','items_points.item_id')
                        .where('items_points.point_id',id)
                        .select('items.title');

                        const serializedPoint =  {
                            
                                ...point,
                                image_url: `http://192.168.15.3:3333/uploads/${point.image}`
                            }
                        

        return res.json({ serializedPoint , items });
        
    }

    async index (req: Request, res: Response){

        const {city,uf,items} = req.query;

        const parsedItems = String(items).split(',').map(items=>Number( items.trim() ));

        const points = await knex('points').
        join('items_points','points.id','=','items_points.point_id')
        .whereIn('items_points.item_id',parsedItems)
        .where('city',String(city))
        .where('uf',String(uf))
        .distinct()
        .select('points.*');
        const serializedPoints = points.map((point) => {
            return {
                ...points,
                image_url: `http://192.168.15.3:3333/uploads/${point.image}`
            }
        })
        return res.json(serializedPoints);
    }

}

export default pointsController;