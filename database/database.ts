import pool from '../config/db-connectors';
import express, { Request, Response } from 'express';
import shortid from 'shortid';
import { JwtService } from '../services/jwt';
import { MailService } from '../services/mail-services';

class TestDatabase {

    static async login(req: Request, res: Response) {
        try {
            console.log('req.body.email',req.body.email);
            
            const client = await pool.connect();
            const { rows } = await client.query(`select * from "user" where email='`+req.body.email+`'`);
            const data = rows;
            if(data.length!=0){
                //user is exist sent Token
                var token= await JwtService.token({ email: data[0].email, id: data[0].id});

                const link= `http://localhost:3001/account/`+token;
                //Mail Trigger
                await MailService.mailTrigger(data[0].email, 'Test Passwordless login', "<h1>Hello,</h1><p>Here's the login link you just requested <p><p>" + link + "</p>");
              
                res.send('we sent you email, please check..');
            }else{
                //user is signup then insert data in our DB
                var username=req.body.username===undefined || req.body.username===null ? null : req.body.username;
                const code = shortid.generate();
                const sql=`INSERT INTO public."user"(email, firebase_uid ,username) VALUES ('`+req.body.email+`','`+code+`',`+username+`)`;
                const dataEmail = await client.query(sql);
                const { rows } = await client.query(`select * from "user" where email='`+req.body.email+`'`);
                const newUserData = rows;
                var token= await JwtService.token({ email: newUserData[0].email, id: newUserData[0].id});

                const link= `http://localhost:3001/account/`+token;
                //Mail Trigger
                await MailService.mailTrigger(newUserData[0].email, 'Test Passwordless login', "<h1>Hello,</h1><p>Here's the login link you just requested <p><p>" + link + "</p>");
              
                res.send('Welcome to the our application!! we sent you email, please check..')
            }
        } catch (error) {
            res.status(400).send(error);
        }
    }

    static async loginToken(req: Request, res: Response) {
       
        const token = req.params.token;
        try {
            res.cookie("jwt", token);  
            res.send('Successfully login');          
        } catch (error) {
            res.status(400).send(error);
        }
    }

    static async getCuisine(req: Request, res: Response) {
        try {
            const client = await pool.connect();
            const sql = "SELECT id, name, description, disabled FROM cuisine;";
            const { rows } = await client.query(sql);
            const todos = rows;
            client.release();
            res.send(todos);
        } catch (error) {
            res.status(400).send(error);
        }
    }

    static async setPreference(req: Request, res: Response){
        try {
            if(req.currentUser?.id!=undefined){
                console.log('req.body.cuisineId',req.body.cuisineId);
                console.log('req.body.priceRange',req.body.priceRange);
                var cuisineId = req.body.cuisineId;
                var priceId=req.body.priceRange;

                const client = await pool.connect();
                const sql = `SELECT * FROM public.cuisine where id IN (` + cuisineId.join(',') + `)`;

                const { rows } = await client.query(sql);
                const cuisineData = rows;
                
                console.log('cuisineData.length',cuisineData.length);
                console.log('cuisineId.length',cuisineId.length);
                
                if(cuisineData.length!=cuisineId.length){
                    res.status(400).send("you sent wrong cuisineId, pls verify it..");
                    return;
                }
                
                await Promise.all(cuisineId.map(async(e:any)=> {
                    const exisitCuisineId = `select * from public.user_cuisine_preference where cuisine_id=${e} AND user_id=${req.currentUser?.id}`;
                    const { rows } =await client.query(exisitCuisineId);
                    const exisitCuisineData=rows;
                    if(exisitCuisineData.length==0){
                        console.log('if');
                        const cuisineIdAddSql = `INSERT INTO public.user_cuisine_preference(user_id, cuisine_id, date_created) VALUES ( ${req.currentUser?.id}, ${e} , (to_timestamp(${Date.now()} / 1000.0)));`
                        const { rows } =await client.query(cuisineIdAddSql);
                        const cuisineIdAddData=rows;
                    }
                }))
            
                var flag=false;
                priceId.forEach((e:any) => {
                    if(e>3){
                       flag=true;
                    }
                });
                if(flag){
                    client.release();
                    res.status(400).send("you sent wrong priceRange, pls verify it, and pass priceRange between [0, 1, 2, 3]");
                }else{
                    await Promise.all(priceId.map(async(e:any)=> {
                        const exisitPriceId = `select * from public.user_price_preference where price_range=${e} AND user_id=${req.currentUser?.id}`;
                        const { rows } =await client.query(exisitPriceId);
                        const exisitPriceData=rows;
                        if(exisitPriceData.length==0){
                            console.log('if');
                            const priceIdAddSql = `INSERT INTO public.user_price_preference(user_id, price_range, date_created) VALUES ( ${req.currentUser?.id}, ${e} , (to_timestamp(${Date.now()} / 1000.0)));`
                            const { rows } =await client.query(priceIdAddSql);
                            const priceIdAddData=rows;
                        }
                    }))
                    client.release();
                    res.send(cuisineData);
                }
            }   
        } catch (error) {
            res.status(400).send(error);
        }
    }
    static async getResturant(req: Request, res: Response){
        try {
            const client = await pool.connect();
            const userPriceId = `select * from public.user_price_preference where user_id=${req.currentUser?.id}`;
            const userCuisineId = `select * from public.user_cuisine_preference where user_id=${req.currentUser?.id}`;
            
            const userPriceResData  = await client.query(userPriceId);
            const userPriceData=userPriceResData.rows;
            console.log('userPriceData',userPriceData);
            var priceRangeArr:any[]=[];
            userPriceData.map((e:any)=>{
                priceRangeArr.push(e.price_range);
            })
            console.log('priceRangeArr',priceRangeArr);
            
            const userCuisineResData =await client.query(userCuisineId);
            const userCuisineData=userCuisineResData.rows;
            console.log('userCuisineData',userCuisineData);
            var userCuisineArr:any[]=[];
            userCuisineData.map((e:any)=>{
                userCuisineArr.push(e.cuisine_id);
            })
            console.log('userCuisineArr',userCuisineArr);
            
            const sql = `select
            restaurant.id,price_range,COVER_IMAGE_URL,NAME,FOURQUARE_RATING,IN_APP_RATING,LOCATION,PRICE_RANGE,MENU_URL,
            SITE,
            REVIEW_COUNT,
            PHONE,
            jsonb_agg(to_jsonb(restaurant_hour)) as restaurant_hours,
            jsonb_agg(to_jsonb(restaurant_photo)) as restaurant_photos,
			jsonb_agg(to_jsonb(restaurant_cuisine.*)) as restaurant_cuisines
            from Public.restaurant
            left join Public.restaurant_hour ON restaurant_hour.restaurant_id = restaurant.id
            left join Public.restaurant_photo ON restaurant_photo.restaurant_id = restaurant.id
            left join Public.restaurant_cuisine ON restaurant_cuisine.restaurant_id = restaurant.id  AND restaurant_cuisine.cuisine_id IN (`+ userCuisineArr.join(',') + `)
            where Public.restaurant.price_range IN (` + priceRangeArr.join(',') + `)
            group by restaurant.id limit 25`;
            const { rows } = await client.query(sql);
            const result = rows;
            client.release();
            res.send({
                "restaurants":result});
        } catch (error) {
            res.status(400).send(error);
        }
    }
}

export default TestDatabase;