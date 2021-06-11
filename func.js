
const Modal = {
	open() {
			document
				.querySelector('.modal-overlay')
				.classList.add('active')
	},
	close() {
			document
				.querySelector('.modal-overlay')
				.classList.remove('active')
	}
}

const Storage = {
	get() {
		return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
	},

	set(transactions) {
		localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
	}
}

const Transaction = {
	all: Storage.get(),
/*
	all: [
		{
			description: 'Luz',
			amount: 50000,
			date: '23/01/2021'
		},
		{
			description: 'Criação website',
			amount: 500000,
			date: '24/01/2021'
		},
		{
			description: 'Internet',
			amount: -20000,
			date: '25/01/2021'
		}
	],
*/

	add(transaction) {
		this.all.push(transaction)
		App.reload()		
	},

	remove(index) {
		this.all.splice(index, 1)
		App.reload()
	},

	incomes() {
		// soma as entradas
		const total = this.all.reduce((acc, item) => {
			if (item.amount > 0) {
				return acc + item.amount
			} 
			return acc			
		}, 0)
		return total
	},

	expenses() {
		// soma as saídas
		const total = this.all.reduce((acc, item) => {
			if (item.amount < 0) {
				return acc + item.amount
			}
			return acc			
		}, 0)
		return total
	},

	total() {
		const total = this.all.reduce((acc, item) => {
			return acc + item.amount			
		}, 0)
		return total
	}
}

const DOM = {
	transactionsContainer: document.querySelector('#data-table tbody'),

	addTransaction(transaction, index) {
		const tr = document.createElement('tr')
		tr.innerHTML = this.innerHTMLTransaction(transaction, index)
		tr.dataset.index = index

		this.transactionsContainer.appendChild(tr)
	},

	innerHTMLTransaction(transaction, index) {
		const CSSclass = transaction.amount > 0 ? "income" : "expense"
		const amount = Utils.formatCurrency(transaction.amount)
		const html = `			
			<td class="description">${transaction.description}</td>
			<td class="${CSSclass}">${amount}</td>
			<td class="date">${transaction.date}</td>
			<td>
					<img onclick="Transaction.remove(${index})" 
						src="./assets/minus.svg" 
						alt="Remover transação" 
					/>
			</td>			
		`
		return html
	}, 

	updateBalance() {
		document
			.getElementById('incomeDisplay')
			.innerHTML = Utils.formatCurrency(Transaction.incomes())
		document
			.getElementById('expenseDisplay')
			.innerHTML = Utils.formatCurrency(Transaction.expenses())
		document
			.getElementById('totalDisplay')
			.innerHTML = Utils.formatCurrency(Transaction.total())
	},

	clearTransactions() {
		this.transactionsContainer.innerHTML = ''
	}
}

const Utils = {
	formatCurrency(value) {
		const signal = Number(value) < 0 ? "-" : ""
		
		// retira tudo o que não for número da string
		String(value).replace(/\,?\.?/g, "")
		value = Number(value) / 100
		value = value.toLocaleString("pt-BR", {
			style: "currency",
			currency: "BRL"
		})

		return value; //signal + value		
	},

	formatAmount(value) {
		value = Number(value) * 100
		return value
	},

	formatDate(date) {
		const arrDate = date.split('-')

		return `${arrDate[2]}/${arrDate[1]}/${arrDate[0]}`
	}
}

const Form = {
	description: document.querySelector('input#description'),
	amount: document.querySelector('input#amount'),
	date: document.querySelector('input#date'),

	getValues() {
		return {
			description: self.description ? self.description.value : "",
			amount: self.amount? self.amount.value : "",
			date: self.date ? self.date.value : ""
		}
	},

	validateFields() {
		const { description, amount, date } = Form.getValues()

		if (!description || !amount || !date) {
			throw new Error('Preencha todos os campos')
		}
	},

	formatValues() {
		let { description, amount, date } = Form.getValues()

		amount = Utils.formatAmount(amount)
		date = Utils.formatDate(date)
		
		return { 
			description,
			amount,
			date
		}
	},

	saveTransaction(transaction) {
		Transaction.add(transaction)
	},

	clearFields() {
		self.description.value = ""
		self.amount.value = ""
		self.date.value = ""
	},

	submit(event) {
		event.preventDefault()
		
		try {
			Form.validateFields()

			const transaction = Form.formatValues()
			Form.saveTransaction(transaction)

			Form.clearFields()

			Modal.close()  

		} catch(err) {
			alert(err.message)
		}
	}
}

const App = {
	init() {
		Transaction.all.forEach((item, index) => (
			DOM.addTransaction(item, index)
		))
		
		DOM.updateBalance()	

		Storage.set(Transaction.all)
	},
	reload() {
		DOM.clearTransactions()
		this.init()
	}
}

App.init()
