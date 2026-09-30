INSERT INTO members
(first_name,last_name,email,phone,membership_date,status)
VALUES
('Daniel','Mensah','daniel.mensah@example.test','416-555-0101','2024-01-14','active'),
('Grace','Owusu','grace.owusu@example.test','416-555-0102','2024-02-04','active'),
('Michael','Brown','michael.brown@example.test','416-555-0103','2024-03-10','active'),
('John','Smith','john.smith@example.test','416-555-0104','2024-04-21','active'),
('Esther','Boateng','esther.boateng@example.test','416-555-0105','2024-05-05','active'),
('Samuel','Kyei','samuel.kyei@example.test','416-555-0106','2024-06-16','active'),
('Ruth','Asare','ruth.asare@example.test','416-555-0107','2024-07-07','active'),
('David','Mensah','david.mensah@example.test','416-555-0108','2024-08-18','active'),
('Mary','Addo','mary.addo@example.test','416-555-0109','2024-09-01','active'),
('Peter','Owusu','peter.owusu@example.test','416-555-0110','2024-10-13','active'),
('Abigail','Amoah','abigail.amoah@example.test','416-555-0111','2024-11-03','active'),
('Joseph','Arthur','joseph.arthur@example.test','416-555-0112','2025-01-12','active'),
('Linda','Asiedu','linda.asiedu@example.test','416-555-0113','2025-02-09','active'),
('Paul','Baffour','paul.baffour@example.test','416-555-0114','2025-03-02','active'),
('Rebecca','Ofori','rebecca.ofori@example.test','416-555-0115','2025-04-06','active'),
('Isaac','Yeboah','isaac.yeboah@example.test','416-555-0116','2025-05-11','active'),
('Naomi','Adjei','naomi.adjei@example.test','416-555-0117','2025-06-15','active'),
('Stephen','Frimpong','stephen.frimpong@example.test','416-555-0118','2025-07-20','active'),
('Martha','Nti','martha.nti@example.test','416-555-0119','2025-08-17','active'),
('Joshua','Agyemang','joshua.agyemang@example.test','416-555-0120','2025-09-14','inactive')
ON CONFLICT DO NOTHING;
