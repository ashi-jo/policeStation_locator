/*
create table users(
	user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY, 
	phone_no varchar(10),
	pincode varchar(6),
	password varchar(100),
	lat float,
	long float,
	ref_id uuid,
	geolocation geography(point, 4326),
	rewards int);

create table ward(
	ward_id UUID  DEFAULT uuid_generate_v4() PRIMARY KEY,
	ward_name varchar(50),
	rewards int,
	ward_location geography(MultiPolygon, 4326),
	username varchar(50),
	password varchar(100),
	ward_head varchar(100)
	);

create table active_complaints(
	complaint_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	user_id UUID references users(user_id), 
	lat float, 
	long float,
	geolocation geography(point, 4326),
	ward_id UUID references ward(ward_id),
	image varchar(150),
	date date,
	time time,
	status varchar(100),
	complaint_address varchar(10000)
	); 
	
create table BMC_worker(
	worker_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	password varchar(50),
	ward_id UUID references ward(ward_id),
	phone_no varchar(10), 
	);

create table resolved_complaints(
	complaint_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	user_id UUID references users(user_id), 
	date date,
	time time,
	ward_id UUID references ward(ward_id),
	resolved_image varchar(150),
	image varchar(150),
	worker_id UUID references BMC_worker(worker_id),
	complaint_address varchar(10000), 
	status varchar(50)
	);

create table campaign(
	campaign_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	organiser_user_id UUID references users(user_id),
	organiser_ward_id UUID references ward(ward_id),
	campaign_name varchar(50),
	lat_of_start float,
	long_of_start float,
	radius float,
	date date,
	time_of_start time,
	time_of_end time,
	ongoing int,
	geolocation geography(point, 4326),
	sentiments integer
);

create table campaign_participation(
	campaign_id UUID references campaign(campaign_id),
	user_id UUID references users(user_id),
	feedback varchar(500), 
	campaign_name varchar(50)
	);

create table latrine(
	latrine_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	lat float,
	long float,
	latrine_location geography(point, 4326)
	);
*/

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
create table users(
	user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY, 
	phone_no varchar(10),
	pincode varchar(6),
	password varchar(100),
	lat float,
	long float,
	ref_id uuid,
	geolocation geography(point, 4326)
	);
	
create table ward(
	ward_id UUID  DEFAULT uuid_generate_v4() PRIMARY KEY,
	ward_name varchar(50),
	ward_location geography(MultiPolygon, 4326)
	);
	
create table complaints(
	complaint_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	user_id UUID references users(user_id), 
	lat float, 
	long float,
	geolocation geography(point, 4326),
	ward_id UUID references ward(ward_id),
	date date,
	time time,
	status varchar(100),
	pincode varchar(10)
	);

create table police_station(
	ps_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	name varchar(100),
	lat float,
	long float,
	location_placename_gid integer,
	location_placename_name varchar(100),
	gid integer,
	ps_location geography(point, 4326)
	);
	

