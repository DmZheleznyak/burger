import React, { Component } from 'react'

import Auxilliary from '../../hoc/Auxilliary'
import Burger from '../../components/Burger/Burger'
import BuildControls from '../../components/Burger/BuildControls/BuildControls'
import Modal from '../../components/UI/Modal/Modal'
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary'
import Spinner from '../../components/UI/Spinner/Spinner'
import withErrorHandler from '../../hoc/withErrorHandler'
import axios from '../../axios-orders'

const INGREDIENT_PRICES = {
	salad: 0.5,
	cheese: 0.4,
	meat: 1.3,
	bacon: 0.7
}

class BurgerBuilder extends Component {
	state = {
		ingredients: {
			salad: 0,
			bacon: 0,
			cheese: 0,
			meat: 0
		},
		totalPrice: 4,
		purchasable: false,
		purchasing: false,
		loading: false
	}

	updatePurchaseState (ingredients) {
		const sum = Object.keys(ingredients)
			.map(igKey => {
				// console.log(ingredients[igKey])
				return ingredients[igKey]
			})
			.reduce( (sum, el) => {
				return sum + el
			}, 0)
		this.setState({ purchasable: sum > 0 })	
	}

	addIngredientHandler = (type) => {
		const oldCount = this.state.ingredients[type]
		const updateCount = oldCount + 1
		const updatedIngredients = {
			...this.state.ingredients
		}
		updatedIngredients[type] = updateCount
		const priceAddition = INGREDIENT_PRICES[type]
		const oldPrice = this.state.totalPrice
		const newPrice = oldPrice + priceAddition
		this.setState({ totalPrice: newPrice, ingredients: updatedIngredients })
		this.updatePurchaseState(updatedIngredients)
	}

	removeIngredientHandler = (type) => {
		const oldCount = this.state.ingredients[type]
		if (oldCount <= 0) {
			return
		}
		const updateCount = oldCount - 1
		const updatedIngredients = {
			...this.state.ingredients
		}
		updatedIngredients[type] = updateCount
		const priceDeduction = INGREDIENT_PRICES[type]
		const oldPrice = this.state.totalPrice
		const newPrice = oldPrice - priceDeduction
		this.setState({ totalPrice: newPrice, ingredients: updatedIngredients })
		this.updatePurchaseState(updatedIngredients)
	}

	purchaseHandler = () => {
		this.setState({ purchasing: true })
	}

	purchaseCancellHandler = () => {
		this.setState({ purchasing: false })
	}

	purchaseContinueHandler = () => {
		this.setState({ loading: true })
		const order = {
			ingredients: this.state.ingredients,
			price: this.state.totalPrice,
			customer: {
				name: 'Dmitriy Zheleznyak',
				address: {
					street: 'Iniziativna 77',
					zipCode: '61177',
					country: 'Ukrain'
				},
				email: 'test@test.com'
			},
			deliveryMethod: 'fastest'
		}
		axios.post('/orders.json', order)
			.then(response => {
				this.setState({ loading: false, purchasing: false })
			})
			.catch(error => {
				this.setState({ loading: false, purchasing: false })
			})
	}

	render() {
		const disabledInfo = {
			...this.state.ingredients
		}
		for (let key in disabledInfo) {
			disabledInfo[key] = disabledInfo[key] <= 0			
		}

		let orderSummary = <OrderSummary 
													ingredients = { this.state.ingredients }
													price = { this.state.totalPrice }
													purchaseCancelled = { this.purchaseCancellHandler }
													purchaseContinued = { this.purchaseContinueHandler } />
		if (this.state.loading) {
			orderSummary = <Spinner />
		}
		// { salad: true, meat: false, ... }
		return (
			<Auxilliary>
				<Modal show = { this.state.purchasing } modalClosed = { this.purchaseCancellHandler }> 
					{ orderSummary }
				</Modal>
				<Burger ingredients={ this.state.ingredients } />
				<BuildControls 
					ingredientAdd = { this.addIngredientHandler }
					ingredientRemove = { this.removeIngredientHandler }	
					disabled = { disabledInfo }
					purchasable = { this.state.purchasable }
					ordered = { this.purchaseHandler }
					price = { this.state.totalPrice }	/>
			</Auxilliary>
		)
	}
}

export default withErrorHandler(BurgerBuilder, axios)