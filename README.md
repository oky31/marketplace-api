## Latar belakang:
- Perusahaan ADC merupakan perusahaan yang menyediakan marketplace untuk layanan pesan antar makanan. 
- Untuk membantu menjalankan bisnisnya, perusahaan membutuhkan sistem aplikasi yang dapat mewadahi toko/penjual makanan dengan menyediakan layan pesan antar sehingga membantu mengakselerasi penjualan produknya.
- Selain itu, pelanggan toko tersebut juga mendapatkan kemudahan karena makanan favoritnya dapat dipesan dari rumahnya.

##### Buatlah API (Application Platform Interface) dengan arsitektur REST API berdasarkan kasus perusahaan ADC dengan ketentuan minimum sebagai berikut:
1. Memiliki User authentication (User login)
2. Memiliki fitur dan user authorization atau Role Base Access Control (Minimal role Admin, penjual, dan pelanggan)
3. Memiliki fitur untuk menambah toko disertai informasi lokasi dan produknya
4. Memiliki fitur untuk mencari produk atau toko berdasarkan lokasi terdekat dengan pelanggan
5. Terdapat error handling ketika terjadi kesalahan pada input request atau pun jika terjadi error sistem
6. Dibuat menggunakan Node js (boleh menggunakan express)

## Running App 
install dependencies:
```
$ npm install
```

run the app:
```
$ DEBUG=market-place-api:* npm start
``` 

## Config 
- config ada di file `.env` 
- `db` mengunakan db gratisan yang ada di mongo atlas, jadi saya share credentialnya saja biar bisa di lihat

## User Authentication 
- User Attribute : 
```
- id
- full name 
- address
- email
- password
- role (Admin, Seller, Customer)
- latitude
- longitude
```

#### Create User Request `POST` -`/users`

- Request user Role `Admin`
```json
{
	"full_name": "oky saputra",
	"address": "Jl. Tubagus Isamil GG. Gemini Bandung",
	"email": "oky@mail.com",
	"password": "password",
	"role": "Admin"
}
```

- Request user Role `Seller` & `Customer`
```json
{
	"full_name": "rudi saputra",
	"address": "Jl. Tubagus ismail GG. Virgo",
	"email": "rudi@mail.com",
	"password": "password",
	"role": "Seller",
	"location": {
		"latitude": -6.88689, 
		"longitude": 107.62421 	
	}
}
```

- Response : 
```json
{
	"data": {}
	"message": "success create user"
}
```


#### User Login
- Payload Request - `POST` `/login` 
```json
{
	'email': 'oky@mail.com',
	'password': 'password'	
}
```
- Response - `HTTP Code (200)`
```json
{
	'message': 'success login',
	'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRhbWExQG1haWwuY29tIiwiaWF0IjoxNzIwNzcyOTAxfQ.Qq431ssmd8xAwBgJ4BYvVg-KlPX-zZkCmZ5SD1zrK3Y'
}
```



## Store 
#### Create Store 
- Endpoint : `POST` - `/stores`
- Header : 
```
Authorization: Bearer <token>
```
- Payload : 
```json
{
    "user_id": "",
	"store_name": "Toko sejahtera",
	"address": "JL. ",
	"location": {
		"latitude": "",
		"longitude": "" 	
	},
	"products": [
		{"name": "Rinso Cair 30 ml", price: 20_000},
		{"name": "Rinso Saset", price: 1_000},
		{"name": "Sabun batang Lux", price: 2_000},
		{"name": "Liveboy", price: 2_500},	
	]
}
```
- `user_id` adalah `id` dari user dengan role `Seller`
- untuk membuat store hanya bisa dengan user role `Admin`

## Pencarian 

#### Pencarian Store
- Endpoint: `GET` - `/stores/nears`
- Response:  menampilkan daftar toko terdekat dengan jarak maks 1km dari lokasi customer
```json
{
	'message': 'success get store',
	'data': [
		{store_name: "xx", address: "xxxx"},	
		{store_name: "xx", address: "xxxx"},	
		{store_name: "xx", address: "xxxx"},	
	]	
}
```
- untuk pencarian hanya untuk user dengan tipe role `Customer`