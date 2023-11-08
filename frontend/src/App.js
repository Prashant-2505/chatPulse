import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from './Pages/Home'
import Chat from './Pages/Chat';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/' element={<Home/>}></Route>
          <Route path='/chat' element={<Chat/>}></Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
