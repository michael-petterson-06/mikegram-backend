const Photo = require('../models/Photo');
const User = require('../models/User');
const mongoose = require('mongoose');


// Insira uma foto com usuário relacionado a mesma
const insertPhoto = async (req, res) => {
    const { title } = req.body;
    const  image  = req.file.filename;
    const reqUser = req.user;
    const user = await User.findById(reqUser._id);

    //Criar uma foto
    const newPhoto = await Photo.create({
        image,
        title,
        userId: user._id,
        userName: user.name,        
    })

    //Se foto criada com sucesso, retorne dados
    if(!newPhoto) {
        res.status(422).json({
            errors: ['Houve um problema tente novamente mais tarde.']
        });
        return;
    }
    res.status(201).json(newPhoto);
}

// Remover foto
const deletePhoto = async(req,res) => {
    const { id } = req.params;
    try {
        const reqUser = req.user;
        const photo = await Photo.findById(new mongoose.Types.ObjectId(id));
        if(!photo) {
            res.status(404).json({ errors: ['Foto não encontrada']});
        return;
    }
    // Checar se foto pertence ao usuário
    if(!photo.userId.equals(reqUser._id)) {
        res.status(422).json({ errors: ['Ocorreu um erro por favor tente mais tarde.']});
        return;
    }

    await Photo.findByIdAndDelete(photo._id);

    res.status(200).json({ id: photo._id, message: 'Foto excluída com sucesso.'});
    } catch (error) {
        res.status(404).json({ errors: ['Foto não encontrada']});
        return;
    }
}   

// Pegar todas as fotos
const getAllPhotos = async(req, res) => {
    const photos = await Photo.find({}).sort([['createdAt',-1]]).exec();
    return res.status(200).json(photos);
}

//Pegar fotos de um determinado usuário
const getUserPhotos = async(req, res) => {
    const { id } = req.params;
    const photos = await Photo.find({userId: id}).sort([['createdAt', -1]]).exec();
    return res.status(200).json(photos);
}

//Pegar uma única foto
const getPhotoById = async(req, res) => {
    const { id } = req.params;
    const photo = await Photo.findById(new mongoose.Types.ObjectId(id));
    if(!photo) {
        res.status(404).json({errors: ['Foto não encontrada.']});
        return;
    }
    res.status(200).json(photo);
}

//Alterar a foto
const updatePhoto = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    const reqUser = req.user;
    const photo = await Photo.findById(id);
    //checar se a foto existe
    if(!photo) {
        res.status(404).json({errors:['Foto não encontrada.']});
        return;
    }
    //Checar se a foto é do usuaŕio que solicita alteração
    if(!photo.userId.equals(reqUser._id)){
        res.status(422)
            .json({errors: ['Ocorreu um erro por favor tente novamente mais tarde.']})
            return;
    }
    if(title) {
        photo.title = title;
    }
    await photo.save();
    res.status(200).json({photo, message: 'Foto atualizada com sucesso!'});
}

//Dar um like
const likePhotos = async (req, res) => {
    const { id } = req.params;
    const reqUser = req.user;
    const photo = await Photo.findById(id);
    if(!photo) {
        res.status(404).json({errors: ['Foto não encontrada.']});
        return;
    }
    //Checar se já deu um like
    if(photo.likes.includes(reqUser._id)) {
        res.status(422).json({errors: ['Você já curtiu a foto']});
        return;
    }
    //Colocar id do ususário no array
    photo.likes.push(reqUser._id);
    photo.save();
    res.status(200).json({ photoId: id, userId: reqUser._id, message: "A foto foi curtida." })
}

//Comentar a foto
const commentPhoto = async(req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
    const reqUser = req.user;
    const user = await User.findById(reqUser._id);
    const photo = await Photo.findById(id);
    if(!photo) {
        res.status(404).json({ errors: ['Foto não encontrada']});
        return;
    }
    
    //Criar comentário
    const userComment = {
        comment,
        userName: user.name,
        userImage: user.profileImage,
        userId: user._id,
    };


    photo.comments.push(userComment);
    await photo.save();

    res.status(200).json({
        comment: userComment,
        message: 'O  comentário foi adicionado com sucesso!',
    })
}

//Buscar fotos
const searchPhotos = async(req, res) => {

    const { q } = req.query;
   
    const photos = await Photo.find({title: new RegExp(q, 'i')}).exec();
    
    res.status(200).json(photos);
    
}

    
  
    
  
    
  

 
module.exports = { 
    insertPhoto,
    deletePhoto,
    getAllPhotos,
    getUserPhotos,
    getPhotoById,
    updatePhoto,
    likePhotos,
    commentPhoto,
    searchPhotos,
 };



