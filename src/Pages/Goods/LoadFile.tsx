import type { FC } from 'react';
import { useState } from 'react';
import axios from '../../axios';

// import NavMenu from '../../components/NavMenu/NavMenu';

// import Box from '@mui/material/Box';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import TextField from '@mui/material/TextField';
// import Button from '@mui/material/Button';

// import { useNavigate } from 'react-router-dom';

// export const LoadFile: FC = () => {
//   const [articleInput, setArticleInput] = useState('');
//   const [nameDeInput, setNameDeInput] = useState('');
//   const [descriptionShortDeInput, setDescriptionShortDeInput] = useState('');

//   const [file, setFile] = useState(null);

//   function articleInputHandler(e: React.ChangeEvent<HTMLInputElement>) {
//     console.log('input=', e.target.value);
//     setArticleInput(e.target.value);
//   }

//   function nameDeInputHandler(e: React.ChangeEvent<HTMLInputElement>) {
//     setNameDeInput(e.target.value);
//   }

//   function descriptionShortDeInputHandler(
//     e: React.ChangeEvent<HTMLInputElement>
//   ) {
//     setDescriptionShortDeInput(e.target.value);
//   }

//   async function saveBtnHandler() {
//     try {
//       const response = await axios.post('/admin_add_new_good', {
//         id: articleInput,

//         name_ru: nameDeInput,

//         description_short_ru: descriptionShortDeInput,
//       });

//       console.log(response);
//     } catch (error) {
//       console.error('Ошибка при выполнении запроса:', error);
//     } finally {
//       console.log('finally');
//     }
//   }



//   //@ts-ignore
//    const handleSubmit = async (e) => {
//     e.preventDefault();
    

//     const formData = new FormData();
//     formData.append('id', articleInput);
//     formData.append('name_ru', nameDeInput);
//     formData.append('description_short_ru', descriptionShortDeInput);
//     //@ts-ignore
//     formData.append('file', file);

//     try {
//         //@ts-ignore
//       const response = await axios.post('/documents', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       });
//       alert('Документ успешно загружен!');
//     } catch (error) {
//         //@ts-ignore
//       alert('Ошибка при загрузке: ' + error.message);
//     } finally {
      
//     }
//   };






//   return (
//     <>
//       <NavMenu />

//       <Box
//         component="form"
//         sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
//         noValidate
//         autoComplete="off"
//       >
//         <List>
//           <ListItem>
//             <TextField
//               id="outlined-basic"
//               label="Article"
//               variant="standard"
//               required
//               onChange={articleInputHandler}
//               value={articleInput}
//             />
//           </ListItem>

//           <ListItem>
//             <TextField
//               id="outlined-basic"
//               label="Name de"
//               variant="standard"
//               required
//               onChange={nameDeInputHandler}
//               value={nameDeInput}
//             />
//           </ListItem>

//           <ListItem>
//             <TextField
//               id="outlined-basic"
//               label="Short Description De"
//               variant="standard"
//               required
//               onChange={descriptionShortDeInputHandler}
//               value={descriptionShortDeInput}
//             />
//           </ListItem>
//         </List>
//       </Box>

//       <Box component="section" sx={{ m: 1 }}>
//         <Button variant="contained" onClick={saveBtnHandler}>
//           Сохранить
//         </Button>
//       </Box>

//     <form onSubmit={handleSubmit}>
//       <input
//         type="text"
//         value={articleInput}
//         // onChange={(e) => articleInputHandler(e)}
//         onChange={(e) => setArticleInput(e.target.value)}
//         placeholder="артикль"
//         required
//       />
      
//       <input
//         type="text"
//         value={nameDeInput}
//         onChange={(e) => nameDeInputHandler(e)}
//         placeholder="имя"
//       />

//       <input
//         type="text"
//         value={descriptionShortDeInput}
//         onChange={(e) => descriptionShortDeInputHandler(e)}
//         placeholder="Описание"
//       />


      
//       <input
//         type="file"
//         //@ts-ignore
//         onChange={(e) => setFile(e.target.files[0])}
//         required
//       />
      
//       <button type="submit">
//          'Отправить'
//       </button>
//     </form>

//     </>
//   );
// };





export const LoadFile: FC = () => {
  const [formData, setFormData] = useState({title: '', description: ''});
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    console.log('[Frontend] Starting upload...');
    console.log('[Frontend] Form data:', formData);
    console.log('[Frontend] Selected file:', file ? file.name : 'None');

    if (!file) {
      setError('Please select a file');
      setIsLoading(false);
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('file', file);

    try {
      const response = await axios.post('/documents', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('[Frontend] Upload successful:', response.data);
      alert('File uploaded successfully!');
    } catch (err) {
      console.error('[Frontend] Upload error:', err);
      console.error('[Frontend] Response:', err.response);
      
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.message || 
                      'Upload failed';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Title*"
        required
      />
      
      <input
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
      />
      
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        required
      />
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
}