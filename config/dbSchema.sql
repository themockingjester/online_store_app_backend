drop database product_store;
create database product_store;
create table users (
uid bigint not null auto_increment primary key,
name varchar(50),
status int not null default 1,
date_of_join datetime not null default current_timestamp,
last_update datetime not null default current_timestamp on update now(),
email varchar(50) not null unique,
password varchar(200) not null);

create table products(
id bigint not null auto_increment primary key,
name varchar(100) not null,
qty_added int not null,
qty_left int not null,
contributor bigint not null,
status int not null, -- 0 means product not active, -1 means product deactivated, 1 means product active,
price_per_unit decimal(8,2) not null,
is_special_item int not null default 0 -- 0 means not an special item,1 means a special item hence user will receive gift
);

create table user_deliveries(
id bigint not null auto_increment primary key,
uid bigint not null,
item_id bigint not null,
status int not null default 1, -- delivery 1 means active delivery, 0 not active, 2 successful delivery, -1 delivery cancelled
reason varchar(100),
delivery_charge decimal(7,2) not null,
item_charge decimal(8,2) not null,
qty int not null,
address_id bigint not null,
is_gift_included int not null default 0, -- 0 means gift not included while 1 means gift is included
date_created datetime not null default current_timestamp,
last_update datetime not null default current_timestamp on update now(),
index main_index (uid,item_id));

create table user_addresses(
id bigint not null auto_increment primary key,
uid bigint not null,
status int not null, -- -1 deleted address, 1 active address
address_type int not null, -- 0 means any address, 1 means default address,
address_line varchar(200) not null,
city varchar(50) not null,
country varchar(50) not null default 'INDIA');
