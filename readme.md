
### Please see the documentation first

link to postman: https://red-flare-706379.postman.co/workspace/Product-store~eff74e88-5cfc-4f09-98f3-105452799aa4/collection/19080795-cd919982-ac60-4311-b114-b4cb5c01a468?action=share&creator=19080795

#### Project Dependency
This project is build on the top of node v16.18.0 and the project uses mysql database (which is hosted in cloud)

#### Steps to run the project
1) After cloning the project from github simply run the command npm install (but you must have nodejs installed on system).
2) Inside root directory enter this command node index.js and boom server will start listening

#### Features of the project
1) Allows the user to create account
2) over 80% of the endpoints can be accessed only when you have successfully logged in.
3) Allows the user to add add multiple delivery addresses.
4) Allows the user to set default delivery address.
5) Allows the user to cancel delivery.
6) Allows to user to view all successfull deliveries, Active Deliveries.
7) Add a product to project inventory.
8) Purchase a product

#### Some tips

1) All the functions which directly interacts with database are placed inside models directory.
2) All the function which receives the user request are placed inside controllers directory.
3) Everything related to api routes are placed inside routes directory.