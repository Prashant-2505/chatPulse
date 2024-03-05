import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, useToast } from '@chakra-ui/react';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const navigate = useNavigate()

    const toast = useToast(); // Added useToast hook for displaying toasts

    const handleClick = () => {
        setShow(!show);
    }

    const submitHandler = async () => {
        setLoading(true);

        try {
            if (!email || !password) {
                toast({
                    title: 'Warning',
                    description: 'Please fill all details.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                    position: 'bottom',
                });
                setLoading(false);
                return;
            }

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const { data } = await axios.post('http://localhost:5000/api/user/login', { email, password }, config);

            toast({
                title: 'Success',
                description: 'Registration Successful',
                status: 'success',
                duration: 5000,
                isClosable: true,
                position: 'bottom',
            });

            localStorage.setItem('userInfo', JSON.stringify(data));
            setLoading(false);
             navigate('/chat');

        } catch (error) {
            toast({
                title: 'Error',
                description: error.response.data.message || 'Unknown Error',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom',
            });
            setLoading(false);
        }
    }

    return (
        <VStack spacing="5px">
            <FormControl id='email' type="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                    placeholder='Enter your Email'
                    onChange={(e) => setEmail(e.target.value)}
                />
            </FormControl>

            <FormControl id='password' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input
                        type={show ? 'text' : 'password'}
                        placeholder='Enter your Password'
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputRightElement>
                        <Button
                            h={'1.75rem'}
                            size={'sm'}
                            onClick={handleClick}
                            p={'1.2rem'}
                        >
                            {show ? 'Hide' : 'Show'}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <Button
                colorScheme='blue'
                width={'100%'}
                marginTop={'15'}
                onClick={submitHandler}
            >
                Submit
            </Button>
        </VStack>
    );
}

export default Login;
