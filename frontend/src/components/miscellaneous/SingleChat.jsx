import React, { useEffect, useState } from 'react'
import { ChatState } from '../../context/ChatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { getSender, getSenderFull } from '../../config/ChatLogics'
import ProfileModal from '../../components/miscellaneous/ProfileModal'
import UpdateGroupChatModal from './UpdateGroupChatModal'
import axios from 'axios'
import './style.css'
import ScrollableChat from './ScrollableChat'

import io from 'socket.io-client'

const ENDPOINT = 'http://localhost:5000'
var socket, selectedChatComapre

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const { user, selectedChat, setSelectedChat } = ChatState()
    const [messages, setMessages] = useState([])
    const [newMessages, setNewMessages] = useState()
    const [loading, setLoading] = useState(false)

    const [socketConnected, setSocketConnected] = useState(false)
    const [typing, setTyping] = useState(false)
    const [isTyping, setIsTyping] = useState(false)

    const toast = useToast()

    const sendMessage = async (e) => {
        if (e.key === 'Enter' && newMessages) {
            socket.emit('stop typing', selectedChat._id)
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };

                setNewMessages("")
                const { data } = await axios.post(`/api/message`, {
                    content: newMessages,
                    chatId: selectedChat._id
                }, config)

                socket.emit('new message', data)
                setMessages([...messages, data])
                console.log(data)
            } catch (error) {
                toast({
                    title: 'Error Occurred',
                    description: 'Failed to send message',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    position: 'bottom',
                });
            }
        }
    }

    const fetchMessages = async (e) => {
        if (!selectedChat) return

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            setLoading(true)
            const { data } = await axios.get(`/api/message/${selectedChat._id}`, config)
            setMessages(data)
            setLoading(false)

            socket.emit('join chat', selectedChat._id)
        } catch (error) {
            toast({
                title: 'Error Occurred',
                description: 'Failed to fetch message',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'bottom',
            });
        }
    }

    useEffect(() => {
        socket = io(ENDPOINT)
        socket.emit('setup', user)
        socket.on('connected', () => {
            setSocketConnected(true)
        })
        socket.on('typing', () => setIsTyping(true))
        socket.on('stop typing', () => setIsTyping(false))

    }, [])

    useEffect(() => {
        fetchMessages()
        selectedChatComapre = selectedChat
    }, [selectedChat])

    useEffect(() => {
        socket.on('message recieved', (newMessageRecieved) => {
            if (!selectedChatComapre || selectedChatComapre._id !== newMessageRecieved.chat._id) {
                // notification
            }
            else {
                setMessages([...messages, newMessageRecieved])
            }
        })
    })


    let typingTimeout;

    const typingHandler = (e) => {
        setNewMessages(e.target.value);
    
        if (!socketConnected) return;
    
        clearTimeout(typingTimeout);
    
        if (!typing) {
            setTyping(true);
            socket.emit('typing', selectedChat._id);
        }
    
        typingTimeout = setTimeout(() => {
            socket.emit('stop typing', selectedChat._id);
            setTyping(false);
        }, 3000);
    };
    


    return (
        <>
            {selectedChat ? (<>
                <Text
                    fontSize={{ base: '28px', md: '30px' }}
                    pb={3}
                    px={2}
                    w={'100%'}
                    display={'flex'}
                    justifyContent={{ base: 'space-between' }}
                    alignItems={'center'}
                >
                    <IconButton
                        display={{ base: 'flex', md: 'none' }}
                        icon={<ArrowBackIcon />}
                        onClick={() => setSelectedChat('')}
                    />

                    {!selectedChat.isGroupChat ?
                        (<>
                            <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                        </>) :
                        (<>
                            {selectedChat.chatName.toUpperCase()}

                            <UpdateGroupChatModal
                                fetchAgain={fetchAgain}
                                setFetchAgain={setFetchAgain}
                                fetchMessages={fetchMessages}
                            />
                        </>)}
                </Text>

                <Box
                    display={'flex'}
                    flexDir={'coloumn'}
                    justifyContent={'flex-end'}
                    p={3}
                    bg={'#E8E8E8'}
                    width={'100%'}
                    h={'100%'}
                    borderRadius={'lg'}
                    overflowY={'hidden'}
                >
                    {loading ?
                        (<Spinner
                            size={'xl'}
                            w={20}
                            h={20}
                            alignSelf={'center'}
                            margin={'auto'}
                        />)
                        :
                        (
                            <div className='messages'>
                                <ScrollableChat messages={messages} />
                            </div>
                        )
                    }

                </Box>
                <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                    {isTyping ? (
                        <div>
                            <p>typing...</p>
                        </div>
                    ) : (
                        <></>
                    )}
                    <Input
                        onChange={typingHandler}
                        value={newMessages}
                    />
                </FormControl>

            </>)
                :
                (
                    <Box display={'flex'}
                        alignItems={'center'}
                        justifyContent={'center'}
                        h={'100%'}>
                        <Text fontSize={'3xl'} pb={3}>
                            Click on a user to start chating
                        </Text>
                    </Box>
                )}
        </>
    )
}

export default SingleChat
