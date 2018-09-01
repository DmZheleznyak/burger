import axios from 'axios'

const instance = axios.create({
	baseURL: 'https://react-burger-max.firebaseio.com/'
})

export default instance