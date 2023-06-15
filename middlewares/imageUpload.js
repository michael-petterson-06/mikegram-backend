const multer = require('multer');
const path = require('path');

//Destination to storage image
const imagesStore = multer.diskStorage({
    destination:(req, file, cd) => {
        let folder = '';
        if(req.baseUrl.includes('users')) { //se a url que a imagem está sendo inserida tiver user
            folder = 'users';
        } else if(req.baseUrl.includes('photos')) {
            folder = 'photos';
        } 
        cd(null, `uploads/${folder}/`)
    },
    filename: (req, file, cd) => {
       
        cd(null, Date.now() + path.extname(file.originalname)); //Criando o nome do arquivo
    }
});


const imageUpload = multer({
    storage: imagesStore,
    fileFilter(req, file, cd) {
        if(!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            //upload only png and jpg formats
            return cd(new Error("Por favor, envie somente png ou jpg!"));
        }    
        cd (undefined, true);
    }
});

module.exports = { imageUpload }