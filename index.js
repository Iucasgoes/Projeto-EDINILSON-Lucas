const express = require('express');
const csv = require('fast-csv');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fs = require('fs');
const csvfile = __dirname + '/../Projeto-EDINILSON-Lucas/public/files/testecsv.csv';
const stream = fs.createReadStream(csvfile);
const port = 3000;
const app = express();

mongoose.connect('mongodb://localhost/db_produto');
var db = mongoose.connection;

db.once('open', function () {
	console.log('A conexão com o MongoDB foi realizada com sucesso.');
});

db.on('error', function (err) {
	console.log(err);
});

var Produto = require('./models/Produto');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, 'public')));

app.get('/produto/:id', function (req, res) {
	Produto.findById(req.params.id, function (err, produto) {
		res.render('produto',
			{
				produto: produto
			});
	});
});

app.get('/produto/edit/:id', function (req, res) {
	Produto.findById(req.params.id, function (err, produto) {
		res.render('edit_produto',
			{
				produto: produto
			});
	});
});

app.get('/', function (req, res) {
	Produto.find({}, function (err, produtos) {
		if (err) {
			console.log(err);
		} else {
			res.render('index', {
				produtos: produtos
			});
		}
	});
});

app.get('/produtos', function (req, res) {
	res.render('add_produto', {
	});
});

app.post('/produtos', function (req, res) {
	var produto = new Produto();
	produto.nome = req.body.nome;
	produto.preco = req.body.preco;
	produto.categoria = req.body.categoria;
	produto.descricao = req.body.descricao;
	produto.fabricante = req.body.fabricante;
	produto.save(function (err) {
		if (err) {
			console.log(err);
		}
		else {
			{
				res.redirect('/');
			}
		}
	});
});

app.get('/produto/delete/:id', function (req, res) {
	var query = { _id: req.params.id }
	Produto.deleteOne(query, function (err) {
		if (err) {
			console.log(err);
		}
		res.redirect('/');
		
	});
});

app.post('/produtos/edit/:id', function (req, res) {
	var produto = {};
	produto.nome = req.body.nome;
	produto.preco = req.body.preco;
	produto.categoria = req.body.categoria;
	produto.descricao = req.body.descricao;
	produto.fabricante = req.body.fabricante;

	var query = { _id: req.params.id }
	Produto.update(query, produto, function (err) {
		if (err) {
			console.log(err);
		}
		else {
			{
				res.redirect('/');
			}
		}
	});
});

app.get('/produtos/import', (req, res, next) => {
	var produto = []
	var csvStream = csv()
		.on("data", (data) => {
			var produto = new Produto({
				nome: data[0],
				preco: data[1],
				categoria: data[2],
				descricao: data[3],
				fabricante: data[4]
			});
			produto.save((error) => {
				console.log(produto);
				if (error) {
					throw error;
				}
			});
		}).on("end", () => {
			console.log(" Fim do arquivo de importação.");
		});
		stream.pipe(csvStream);
		res.redirect('/')
		next.json({ success: "Os dados foram importados com sucessos.", status: 200 });
});

app.listen(port);
console.log("O servidor está rodando na porta "+ port + ".");