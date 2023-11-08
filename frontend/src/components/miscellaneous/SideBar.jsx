import { Avatar, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Spinner, Text, Tooltip, useDisclosure, useToast } from '@chakra-ui/react'
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons'
import React, { useState } from 'react'
import { AiOutlineSearch } from 'react-icons/ai'
import { ChatState } from '../../context/ChatProvider'
import ProfileModal from './ProfileModal'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ChatLoading from './ChatLoading'
import UserListItem from '../UserAvatar/UserListItem'

const SideBar = () => {
    const [search, setSearch] = useState()
    const [searchResult, setSearchResult] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadingChat, setLoadingChat] = useState(false)

    const { user, chats, setChats, setSelectedChat } = ChatState()

    const navigate = useNavigate()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const btnRef = React.useRef()

    const toast = useToast()

    const logoutHandler = () => {
        localStorage.removeItem('userInfo')
        navigate('/')
    }


    const handleSearch = async () => {
        if (!search) {
            toast({
                title: "Please Enter something in search",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top-left",
            });
            return;
        }

        try {
            setLoading(true);

            const response = await axios.get(`/api/user?search=${search}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            setSearchResult(response.data);
            console.log(searchResult)
        } catch (error) {
            toast({
                title: "Error Occurred!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        } finally {
            setLoading(false);
        }
    };


    const accessChat = async (userId) => {
        try {
            setLoadingChat(true)
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                }
            }

            const { data } = await axios.post('/api/chat', { userId }, config)
            setSelectedChat(data)
            setLoadingChat(false)
            onClose()
         


        } catch (error) {
            toast({
                title: "Error in Fetching Chat",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    }


    return (
        <>

            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                bg={'white'}
                width={'100%'}
                padding={"5px 10px 5px 10px"}
                borderWidth={'5px'}
            >
                <Tooltip label="Search Users to Chat"
                    hasArrow
                    placement='bottom-end'
                >
                    <Button
                        variant={"ghost"}
                        ref={btnRef}
                        onClick={onOpen}
                    >
                        <AiOutlineSearch />
                        <Text display={{ base: 'none', md: 'flex' }} px='4'>
                            Search User
                        </Text>
                    </Button>
                </Tooltip>
                <Text fontSize={'2xl'}>
                    ChatPulse
                </Text>
                <div>
                    <Menu
                    >
                        <MenuButton p={1} as={Button}>
                            <BellIcon fontSize={'2xl'} m={1} />
                        </MenuButton>
                        <MenuList>
                            <MenuItem>Download</MenuItem>
                            <MenuItem>Create a Copy</MenuItem>
                            <MenuItem>Mark as Draft</MenuItem>
                            <MenuItem>Delete</MenuItem>
                            <MenuItem>Attend a Workshop</MenuItem>
                        </MenuList>
                    </Menu>

                    <Menu
                    >
                        <MenuButton p={1} as={Button} rightIcon={<ChevronDownIcon fontSize={'2xl'} m={1} />}>
                            <Avatar size={'sm'} cursor={'pointer'}
                                name={user.name}
                                src={user.pic}
                            />
                        </MenuButton>
                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem>My Profile</MenuItem>
                            </ProfileModal>
                            <MenuDivider />
                            <MenuItem onClick={logoutHandler}>LogOut</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>
            <Drawer isOpen={isOpen} placement="left" onClose={onClose} finalFocusRef={btnRef}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader>Search User</DrawerHeader>
                    <DrawerBody>
                        <Box display="flex" pb={2}>
                            <Input
                                placeholder="Search by name or email"
                                mr={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button onClick={handleSearch}>Go</Button>
                        </Box>
                        {loading ? (
                            <ChatLoading />
                        ) : (
                            searchResult?.map((user) => (
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    handleFunction={() => accessChat(user._id)}
                                />
                            ))
                        )}
                        {loadingChat && <Spinner ml='auto' d='flex' />}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>


        </>
    )
}

export default SideBar
