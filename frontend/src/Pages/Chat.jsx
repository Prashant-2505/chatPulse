import React, { useState } from 'react'
import { ChatState, useChat } from '../context/ChatProvider'
import { Box } from '@chakra-ui/react'
import SideBar from '../components/miscellaneous/SideBar'
import MyChats from '../components/miscellaneous/MyChats'
import ChatBox from '../components/miscellaneous/ChatBox'

const Chat = () => {

  const [fetchAgain, setFetchAgain] = useState(false)
  const { user } = ChatState()

  return (
    <div style={{ width: "100%" }}>
      {user && <SideBar />}
      <Box
        display="flex"
        justifyContent="space-between"
        width={"100%"}
        height={"91.5vh"}
        padding={"10px"}
        
      >
        {user && <MyChats fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>}
        {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>}
      </Box>
    </div>
  )
}

export default Chat
