<?php

const SMTP_HOST = "SSL0.OVH.NET";
const SMTP_USER = "noreply@coteaux-abbaye-caen.fr";
const SMTP_PASS = 'DCAN1!gU^y#=={&pX2Q}d[vhh"Aa!C';
const SMTP_PORT = 465;
const SMTP_ENCRYPT = 'ssl';

const MAIL_RECEIVER = "formulaire.Caen_ca@marketing-lab.com";
const SEND_COPY_TO = null;

CONST MANDATORY_FIELDS = array(
    "residence",
    "firstname",
    "lastname",
    "email",
    "phone",
    "cp",
    "city"
);
