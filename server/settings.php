<?php

const SMTP_HOST = "hr2992636697.reseller.mis.ovh.net";
const SMTP_USER = "noreply@axeon.fr";
const SMTP_PASS = "xVqu887?";
const SMTP_PORT = 587;
const SMTP_ENCRYPT = 'tls';

const MAIL_RECEIVER = "sebastien.montlibert@axeon-software.com";
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