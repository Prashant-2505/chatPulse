import { Box, Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, StackDivider, VStack, useToast } from '@chakra-ui/react'
import React from 'react'
import { initializeApp } from "firebase/app";
import { firebaseConfig, firebaseStorageUrl } from '../../firebase'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from "react-router-dom";
const Signup = () => {

    const [name, setName] = useState()
    const [email, setEmail] = useState()
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState()
    const [pic, setPic] = useState()
    const [loading, setLoading] = useState(false)

    const [show, setShow] = useState()

    const toast = useToast()

    const navigate = useNavigate()

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app, firebaseStorageUrl);

    const createUniqueFileName = (getFile) => {
        const timeStamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 12);
        return `${getFile.name}-${timeStamp}-${randomString}`;
    };

    const helperForUploadingImageToFirebase = async (file) => {
        try {
            const getFileName = createUniqueFileName(file);
            const storageReference = ref(storage, `user-pic/${getFileName}`);
            const uploadImg = uploadBytesResumable(storageReference, file);

            return new Promise((resolve, reject) => {
                uploadImg.on('state_changed', (snapshot) => { },
                    (error) => {
                        console.error(error);
                        reject(error);
                    },
                    () => {
                        getDownloadURL(uploadImg.snapshot.ref)
                            .then((downloadURL) => resolve(downloadURL))
                            .catch((error) => {
                                console.error(error);
                                reject(error);
                            });
                    }
                );
            });
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const postDetails = async (file) => {
        setLoading(true);
        try {
            const extractImageUrl = await helperForUploadingImageToFirebase(file);
            setPic(extractImageUrl)
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Failed to upload image.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
        setLoading(false);
    }



    const handleClick = () => {
        setShow(!show)
    }

    const submitHandler = async () => {
        setLoading(true)
        if (!name || !email || !password || !confirmPassword) {
            toast({
                title: 'Warning',
                description: 'Please fill all details.',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            toast({
                title: 'Warning',
                description: 'Password not matched.',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            setLoading(false)
            return
        }

        try {
            const config = {
                headers: {
                    "Content-type": "application/json"
                },
            }

            const { data } = await axios.post('http://localhost:5000/api/user/',
                { name, email, password, confirmPassword, pic },
                config)

            toast({
                title: 'Sucess',
                description: 'Registeration Succesfull',
                status: 'success',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });

            localStorage.setItem('userInfo', JSON.stringify(data))
            setLoading(false)
            navigate('/chat')
        } catch (error) {
            toast({
                title: 'Sucess',
                description: error.response.data.message,
                status: 'success',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            setLoading(false)

        }
    }

    return (

        <VStack
            spacing={"5px"}
        >
            <FormControl id='First-name' isRequired>
                <FormLabel> Name</FormLabel>
                <Input
                    placeholder='Enter your name'
                    onChange={(e) => setName(e.target.value)}
                ></Input>
            </FormControl>

            <FormControl id='email' type={"email"} isRequired>
                <FormLabel> Email</FormLabel>
                <Input
                    placeholder='Enter your Email'
                    onChange={(e) => setEmail(e.target.value)}
                ></Input>
            </FormControl>

            <FormControl id='password' isRequired>
                <FormLabel> Password</FormLabel>
                <InputGroup>
                    <Input
                        type={show ? "text" : "password"}
                        placeholder='Enter your Password'
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputRightElement>
                        <Button h={'1.75rem'}
                            size={"sm"}
                            onClick={handleClick}
                            p={"1.2rem"}
                        >
                            {show ? 'Hide' : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>

            </FormControl>


            <FormControl id='confirm-password' isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                    <Input
                        type={show ? "text" : "password"}
                        placeholder='Enter your Password'
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <InputRightElement>
                        <Button h={'1.75rem'}
                            size={"sm"}
                            onClick={handleClick}
                            p={"1.2rem"}
                        >
                            {show ? 'Hide' : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>

            </FormControl>

            <FormControl id='pic'

                isRequired>
                <FormLabel> Upoad your Picture</FormLabel>
                <Input
                    type="file"
                    accept="image/"
                    p={"1.5"}
                    onChange={(e) => postDetails(e.target.files[0])}
                ></Input>
            </FormControl>

            <Button colorScheme='blue'
                width={"100%"}
                marginTop={"15"}
                onClick={submitHandler}
                isLoading={loading}
            >
                Submit
            </Button>

        </VStack>

    )
}

export default Signup
