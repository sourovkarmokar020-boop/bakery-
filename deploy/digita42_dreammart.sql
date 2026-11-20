-- ============================================================
--  Dream Mart — Database
--  Target   : digita42_dreammart   (cPanel · MySQL / MariaDB)
--  Tables   : 44
--  Built    : 2026-07-29 16:23
--
--  Import   : cPanel → phpMyAdmin → digita42_dreammart → Import
--
--  NOTE: ছবির সব লিংক site-relative (/backend/storage/... এবং
--        /assets/uploads/...), তাই ডোমেইন বদলালেও ছবি ঠিক থাকবে।
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `abandoned_carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `abandoned_carts` (
  `id` char(36) NOT NULL,
  `customer_phone` text DEFAULT NULL,
  `customer_name` text DEFAULT NULL,
  `customer_email` text DEFAULT NULL,
  `customer_address` text DEFAULT NULL,
  `delivery_area` text DEFAULT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`items`)),
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `delivery_charge` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` text DEFAULT NULL,
  `recovered` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `abandoned_carts_recovered_created_idx` (`recovered`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `abandoned_carts` WRITE;
/*!40000 ALTER TABLE `abandoned_carts` DISABLE KEYS */;
INSERT INTO `abandoned_carts` VALUES ('172c4fe9-47a7-4e41-bb15-b2e855581d74','017663666638','sourov',NULL,'Dhaka','ঢাকার ভিতরে','[{\"id\":\"b3000000-0000-4000-8000-000000000004\",\"name\":\"\\u09aa\\u09cd\\u09b0\\u09bf\\u09ae\\u09bf\\u09af\\u09bc\\u09be\\u09ae \\u09b8\\u09bf\\u0995\\u09cd\\u09b8-\\u09aa\\u09bf\\u09b8 \\u09b9\\u09cd\\u09af\\u09be\\u09a8\\u09cd\\u09a1\\u09ac\\u09cd\\u09af\\u09be\\u0997 \\u09b8\\u09c7\\u099f\",\"price\":\"2390.00\",\"quantity\":1,\"image\":\"\\/assets\\/uploads\\/product-images\\/ladies-bag\\/premium-six-piece-handbag-set.webp\"}]',2460.00,70.00,'cod',1,'2026-07-28 06:22:08','2026-07-28 06:22:42'),('1f65ac7e-0652-4621-b7e3-dca41cebf066','8384483w84','S M Ruhul Amin',NULL,'40/B, Abdul Hadi Lane, Bangshal, Dhaka',NULL,'[{\"id\":\"b2000000-0000-4000-8000-000000000005\",\"name\":\"Royal Oud Eau De Parfum 100ml\",\"price\":\"1650.00\",\"quantity\":1,\"image\":\"\\/assets\\/uploads\\/product-images\\/fashion\\/royal-oud-eau-de-parfum-100ml.webp\"}]',1650.00,0.00,'cod',0,'2026-07-28 06:45:55','2026-07-28 06:45:55'),('3aafdc72-87de-4ae5-b7be-0039df26696e','0174948494844','sourov',NULL,'sourov@gmail.com','ঢাকার ভিতরে','[{\"id\":\"b2000000-0000-4000-8000-000000000005\",\"name\":\"Royal Oud Eau De Parfum 100ml\",\"price\":\"1650.00\",\"quantity\":1,\"image\":\"\\/assets\\/uploads\\/product-images\\/fashion\\/royal-oud-eau-de-parfum-100ml.webp\"}]',1720.00,70.00,'cod',1,'2026-07-28 06:26:09','2026-07-28 06:26:29'),('492dee23-da38-4aa5-952b-459a0c952070','0176667666556',NULL,NULL,NULL,NULL,'[{\"id\":\"b3000000-0000-4000-8000-000000000004\",\"name\":\"\\u09aa\\u09cd\\u09b0\\u09bf\\u09ae\\u09bf\\u09af\\u09bc\\u09be\\u09ae \\u09b8\\u09bf\\u0995\\u09cd\\u09b8-\\u09aa\\u09bf\\u09b8 \\u09b9\\u09cd\\u09af\\u09be\\u09a8\\u09cd\\u09a1\\u09ac\\u09cd\\u09af\\u09be\\u0997 \\u09b8\\u09c7\\u099f\",\"price\":\"2390.00\",\"quantity\":2,\"image\":\"\\/assets\\/uploads\\/product-images\\/ladies-bag\\/premium-six-piece-handbag-set.webp\"},{\"id\":\"b2000000-0000-4000-8000-000000000005\",\"name\":\"\\u09b0\\u09af\\u09bc\\u09cd\\u09af\\u09be\\u09b2 \\u0989\\u09a6 \\u0987\\u0993 \\u09a1\\u09bf \\u09aa\\u09be\\u09b0\\u09ab\\u09bf\\u0989\\u09ae \\u09e7\\u09e6\\u09e6 \\u09ae\\u09bf.\\u09b2\\u09bf.\",\"price\":\"1650.00\",\"quantity\":1,\"image\":\"\\/assets\\/uploads\\/product-images\\/fashion\\/royal-oud-eau-de-parfum-100ml.webp\"}]',6430.00,0.00,'cod',0,'2026-07-28 07:25:21','2026-07-28 07:25:21'),('4eb46e4d-044f-4449-97c9-4ca8f0272327','1076649939484','sourov',NULL,'dhaka','ঢাকার ভিতরে','[{\"id\":\"b3000000-0000-4000-8000-000000000004\",\"name\":\"Premium Six-Piece Handbag Set\",\"price\":\"2390.00\",\"quantity\":1,\"image\":\"\\/assets\\/uploads\\/product-images\\/ladies-bag\\/premium-six-piece-handbag-set.webp\"}]',2460.00,70.00,'cod',0,'2026-07-28 06:29:41','2026-07-28 06:30:05'),('78634f91-b799-427b-84f1-2194f80d50a1','0176667666556','S M Ruhul Amin',NULL,'40/B, Abdul Hadi Lane, Bangshal, Dhaka','ঢাকার ভিতরে','[{\"id\":\"b3000000-0000-4000-8000-000000000004\",\"name\":\"\\u09aa\\u09cd\\u09b0\\u09bf\\u09ae\\u09bf\\u09af\\u09bc\\u09be\\u09ae \\u09b8\\u09bf\\u0995\\u09cd\\u09b8-\\u09aa\\u09bf\\u09b8 \\u09b9\\u09cd\\u09af\\u09be\\u09a8\\u09cd\\u09a1\\u09ac\\u09cd\\u09af\\u09be\\u0997 \\u09b8\\u09c7\\u099f\",\"price\":\"2390.00\",\"quantity\":2,\"image\":\"\\/assets\\/uploads\\/product-images\\/ladies-bag\\/premium-six-piece-handbag-set.webp\"},{\"id\":\"b2000000-0000-4000-8000-000000000005\",\"name\":\"\\u09b0\\u09af\\u09bc\\u09cd\\u09af\\u09be\\u09b2 \\u0989\\u09a6 \\u0987\\u0993 \\u09a1\\u09bf \\u09aa\\u09be\\u09b0\\u09ab\\u09bf\\u0989\\u09ae \\u09e7\\u09e6\\u09e6 \\u09ae\\u09bf.\\u09b2\\u09bf.\",\"price\":\"1650.00\",\"quantity\":1,\"image\":\"\\/assets\\/uploads\\/product-images\\/fashion\\/royal-oud-eau-de-parfum-100ml.webp\"}]',6500.00,70.00,'cod',1,'2026-07-28 07:25:22','2026-07-28 07:25:29'),('86e6ffcf-8f79-4161-aafe-e84637fcb08e',NULL,'S M Ruhul Amin',NULL,'40/B, Abdul Hadi Lane, Bangshal, Dhaka',NULL,'[{\"id\":\"586e415d-9f54-4841-b4d2-2f08cbaac49c\",\"name\":\"Men\'s Golden Skeleton Dial Watch\",\"price\":\"2950.00\",\"quantity\":1,\"image\":\"\\/backend\\/storage\\/uploads\\/product-images\\/hvHXF8nmLPgkjqs8TAnWzI38hbfuE60rPCjGqQis.webp\"}]',2950.00,0.00,'cod',0,'2026-07-29 06:50:06','2026-07-29 06:50:06'),('8b4d32b1-c242-4adf-a76f-65f130d64d23','0176636638','sourov',NULL,'so9ro@gmail.ocm','ঢাকার ভিতরে','[{\"id\":\"b2000000-0000-4000-8000-000000000005\",\"name\":\"\\u09b0\\u09af\\u09bc\\u09cd\\u09af\\u09be\\u09b2 \\u0989\\u09a6 \\u0987\\u0993 \\u09a1\\u09bf \\u09aa\\u09be\\u09b0\\u09ab\\u09bf\\u0989\\u09ae \\u09e7\\u09e6\\u09e6 \\u09ae\\u09bf.\\u09b2\\u09bf.\",\"price\":\"1650.00\",\"quantity\":2,\"image\":\"\\/assets\\/uploads\\/product-images\\/fashion\\/royal-oud-eau-de-parfum-100ml.webp\"}]',3370.00,70.00,'cod',0,'2026-07-28 06:23:39','2026-07-28 06:24:07'),('ae24bbfc-5064-4ca2-9a8a-aef7c5ca1ad7','0176667666556','S M Ruhul Amin',NULL,'40/B, Abdul Hadi Lane, Bangshal, Dhaka','ঢাকার ভিতরে','[{\"id\":\"b3000000-0000-4000-8000-000000000004\",\"name\":\"Premium Six-Piece Handbag Set\",\"price\":\"2390.00\",\"quantity\":1,\"image\":\"\\/assets\\/uploads\\/product-images\\/ladies-bag\\/premium-six-piece-handbag-set.webp\"}]',2460.00,70.00,'cod',1,'2026-07-28 06:42:46','2026-07-28 06:44:28'),('ce013a84-701b-4b4d-a9f0-d5bbdbcbd5f1','4566466','S M Ruhul Amin',NULL,'40/B, Abdul Hadi Lane, Bangshal, Dhaka','ঢাকার ভিতরে','[{\"id\":\"586e415d-9f54-4841-b4d2-2f08cbaac49c\",\"name\":\"Men\'s Golden Skeleton Dial Watch\",\"price\":\"2950.00\",\"quantity\":1,\"image\":\"\\/backend\\/storage\\/uploads\\/product-images\\/hvHXF8nmLPgkjqs8TAnWzI38hbfuE60rPCjGqQis.webp\"}]',3020.00,70.00,'cod',1,'2026-07-29 06:50:06','2026-07-29 06:50:15'),('ec046f23-7e3d-4fec-9a05-433fc292e52c',NULL,'S M Ruhul Amin',NULL,'40/B, Abdul Hadi Lane, Bangshal, Dhaka',NULL,'[{\"id\":\"b2000000-0000-4000-8000-000000000005\",\"name\":\"Royal Oud Eau De Parfum 100ml\",\"price\":\"1650.00\",\"quantity\":1,\"image\":\"\\/assets\\/uploads\\/product-images\\/fashion\\/royal-oud-eau-de-parfum-100ml.webp\"}]',1650.00,0.00,'cod',0,'2026-07-28 06:45:54','2026-07-28 06:45:54'),('edf66d86-7383-46ba-8c07-b687a337d4a6','55533444444443','S M Ruhul Amin',NULL,'40/B, Abdul Hadi Lane, Bangshal, Dhaka','ঢাকার ভিতরে','[{\"id\":\"b3000000-0000-4000-8000-000000000004\",\"name\":\"\\u09aa\\u09cd\\u09b0\\u09bf\\u09ae\\u09bf\\u09af\\u09bc\\u09be\\u09ae \\u09b8\\u09bf\\u0995\\u09cd\\u09b8-\\u09aa\\u09bf\\u09b8 \\u09b9\\u09cd\\u09af\\u09be\\u09a8\\u09cd\\u09a1\\u09ac\\u09cd\\u09af\\u09be\\u0997 \\u09b8\\u09c7\\u099f\",\"price\":\"2390.00\",\"quantity\":2,\"image\":\"\\/assets\\/uploads\\/product-images\\/ladies-bag\\/premium-six-piece-handbag-set.webp\"}]',4850.00,70.00,'cod',0,'2026-07-28 07:03:22','2026-07-28 07:03:31');
/*!40000 ALTER TABLE `abandoned_carts` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `banner_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `banner_categories` (
  `id` char(36) NOT NULL,
  `name` text NOT NULL,
  `slug` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `banner_categories_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `banner_categories` WRITE;
/*!40000 ALTER TABLE `banner_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `banner_categories` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `banners` (
  `id` char(36) NOT NULL,
  `title` text DEFAULT NULL,
  `image_url` text NOT NULL,
  `redirect_url` text DEFAULT NULL,
  `placement` varchar(255) NOT NULL DEFAULT 'hero',
  `category_id` char(36) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `title_en` text DEFAULT NULL,
  `title_bn` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `banners_category_active_sort_idx` (`category_id`,`is_active`,`sort_order`),
  KEY `banners_active_sort_idx` (`is_active`,`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES ('b1000000-0000-4000-8000-000000000001','Fashion & Gifts','/assets/uploads/banner-images/hero-fashion-gifts-v2.webp','/categories','hero',NULL,1,1,'2026-07-21 14:36:25','2026-07-21 14:36:25','Fashion & Gifts','ফ্যাশন ও গিফট'),('b1000000-0000-4000-8000-000000000002','Home Essentials','/assets/uploads/banner-images/hero-home-essentials-v2.webp','/categories','hero',NULL,1,2,'2026-07-21 14:36:25','2026-07-21 14:36:25','Home Essentials','হোম এসেনশিয়ালস'),('f1a11111-1111-4111-8111-111111111111','সামার ফ্যাশন সেল','/backend/storage/uploads/banner-images/Iu5NE3cpMQqnvUazkePUkEAOB7VKStLKukA420Uf.webp','/categories','fashion',NULL,1,1,'2026-07-21 08:24:53','2026-07-26 03:05:35','Summer Fashion Sale','সামার ফ্যাশন সেল'),('f2a22222-2222-4222-8222-222222222222','মেগা ফ্যাশন সেল','/backend/storage/uploads/banner-images/agZHd2sEUjPOs3OzeX9UyjjP4VFINzF9VRqkVA4Z.webp','/categories','fashion',NULL,1,2,'2026-07-21 08:24:53','2026-07-29 07:42:39','Mega Fashion Sale','মেগা ফ্যাশন সেল'),('f3a33333-3333-4333-8333-333333333333','উইকেন্ড স্পেশাল সেল','/backend/storage/uploads/banner-images/RO98Ic3YsWGkDdhbVRNhPkQCxu7FeRll8tmQqx5e.webp','/categories','fashion',NULL,1,3,'2026-07-21 08:24:53','2026-07-29 07:47:59','Weekend Special Sale','উইকেন্ড স্পেশাল সেল');
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `bkash_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bkash_settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `app_key` varchar(255) DEFAULT NULL,
  `app_secret` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `mode` varchar(255) NOT NULL DEFAULT 'sandbox',
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `bkash_settings` WRITE;
/*!40000 ALTER TABLE `bkash_settings` DISABLE KEYS */;
INSERT INTO `bkash_settings` VALUES (1,NULL,NULL,NULL,NULL,'sandbox',0,'2026-07-26 02:18:52','2026-07-26 02:18:52');
/*!40000 ALTER TABLE `bkash_settings` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `blocked_customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `blocked_customers` (
  `id` char(36) NOT NULL,
  `customer_name` text DEFAULT NULL,
  `phone` text DEFAULT NULL,
  `ip_address` text DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `blocked_customers` WRITE;
/*!40000 ALTER TABLE `blocked_customers` DISABLE KEYS */;
/*!40000 ALTER TABLE `blocked_customers` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `blogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `blogs` (
  `id` char(36) NOT NULL,
  `title` text NOT NULL,
  `slug` varchar(255) NOT NULL,
  `excerpt` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `focus_keyword` varchar(255) DEFAULT NULL,
  `title_en` text DEFAULT NULL,
  `title_bn` text DEFAULT NULL,
  `excerpt_en` text DEFAULT NULL,
  `excerpt_bn` text DEFAULT NULL,
  `content_en` longtext DEFAULT NULL,
  `content_bn` longtext DEFAULT NULL,
  `category_en` varchar(255) DEFAULT NULL,
  `category_bn` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `blogs_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `blogs` WRITE;
/*!40000 ALTER TABLE `blogs` DISABLE KEYS */;
INSERT INTO `blogs` VALUES ('56791417-88c3-11f1-8cc1-28d0eaec4da6','পুরুষদের জন্য প্রিমিয়াম স্কাই ব্লু স্ট্রাইপ ফরমাল শার্ট – অফিস ও স্মার্ট লুকের সেরা পছন্দ','premium-sky-blue-stripe-formal-shirt-men','প্রিমিয়াম স্কাই ব্লু স্ট্রাইপ ফরমাল শার্ট, যা আরামদায়ক কাপড়, স্টাইলিশ ডিজাইন এবং স্মার্ট ফিটের সমন্বয়ে অফিস, মিটিং ও বিশেষ অনুষ্ঠানের জন্য আদর্শ।','<p>একজন রুচিশীল পুরুষের পোশাকের সংগ্রহে একটি মানানসই ফরমাল শার্ট থাকা অপরিহার্য। এই প্রিমিয়াম স্কাই ব্লু স্ট্রাইপ ফরমাল শার্টটি এমনভাবে তৈরি করা হয়েছে যা আপনাকে মার্জিত লুক দেওয়ার পাশাপাশি সারাদিন সর্বোচ্চ আরামও নিশ্চিত করবে। অফিসে যাওয়া, ব্যবসায়িক মিটিং বা কোনো আনুষ্ঠানিক অনুষ্ঠানে—সবক্ষেত্রেই এই শার্টটি আভিজাত্য ও উপযোগিতার এক চমৎকার সমন্বয়।</p><p><br></p><p>এর সতেজ আকাশী নীল রঙের ওপর সরু সাদা উল্লম্ব স্ট্রাইপ একটি কালজয়ী ও পেশাদার লুক তৈরি করে। স্ট্রাইপের সূক্ষ্ম নকশাটি শার্টটিতে আভিজাত্য যোগ করে কিন্তু তা কখনোই দৃষ্টিকটু বা অতিরিক্ত মনে হয় না; ফলে সব বয়সের পেশাজীবীদের জন্যই এটি মানানসই।</p><p><br></p><p>উন্নত মানের ও বাতাস চলাচলে সক্ষম (breathable) কাপড়ে তৈরি হওয়ায় দীর্ঘ সময় কাজ করার সময়ও আপনি এতে স্বাচ্ছন্দ্য বোধ করবেন। হালকা ওজনের এই কাপড়টি বাতাস চলাচলে সহায়তা করে, যা আপনাকে সারাদিন শীতল ও সতেজ রাখে। এর কোমল টেক্সচার ত্বকের ওপর আরামদায়ক অনুভূতি দেয়, তাই এটি প্রতিদিন ব্যবহারের জন্য আদর্শ।</p><p><br></p><p>এর স্লিম-ফিট কাটিং আপনার শারীরিক গঠনকে সুন্দরভাবে ফুটিয়ে তোলে এবং একই সাথে একটি পরিপাটি ও মার্জিত ভাব বজায় রাখে। ক্লাসিক কলার, প্রিমিয়াম মানের বোতাম এবং পরিচ্ছন্নভাবে তৈরি কাফ—সবকিছুতেই এর উন্নত কারুকার্য ফুটে ওঠে। দীর্ঘস্থায়ী ব্যবহারের নিশ্চয়তা দিতে প্রতিটি সেলাই অত্যন্ত যত্নসহকারে সম্পন্ন করা হয়েছে।</p><p><br></p><p>এই ফরমাল শার্টটির অন্যতম বড় সুবিধা হলো এর বহুমুখী ব্যবহারযোগ্যতা। ক্লাসিক কর্পোরেট লুকের জন্য কালো ট্রাউজার, আধুনিক ব্যবসায়িক সাজের জন্য নেভি ব্লু প্যান্ট কিংবা স্মার্ট ক্যাজুয়াল লুকের জন্য বেইজ রঙের চিনোস প্যান্টের সাথে এটি অনায়াসেই মানিয়ে যায়। এছাড়া ব্লেজার, স্যুট, টাই এবং চামড়ার জুতার সাথেও এটিখাঁটি খেজুর সরবরাহ করি।</p>','পুরুষদের ফ্যাশন','/backend/storage/uploads/site-settings/pIwGMcy3mNZIHZTgpCnW2K3FBaclfabwEVPR7G7A.webp',1,'2026-02-26 04:00:00','2026-07-26 01:57:49',NULL,'Premium Sky Blue Stripe Formal Shirt for Men – Perfect for Office & Business Wear','পুরুষদের জন্য প্রিমিয়াম স্কাই ব্লু স্ট্রাইপ ফরমাল শার্ট – অফিস ও স্মার্ট লুকের সেরা পছন্দ','Discover our premium sky blue stripe formal shirt for men. Crafted from breathable fabric with a slim fit design, perfect for office, business meetings, and formal occasions.','প্রিমিয়াম স্কাই ব্লু স্ট্রাইপ ফরমাল শার্ট, যা আরামদায়ক কাপড়, স্টাইলিশ ডিজাইন এবং স্মার্ট ফিটের সমন্বয়ে অফিস, মিটিং ও বিশেষ অনুষ্ঠানের জন্য আদর্শ।','<p>A well-fitted formal shirt is an essential part of every gentleman\'s wardrobe. This Premium Sky Blue Stripe Formal Shirt is designed to deliver a sophisticated appearance while ensuring maximum comfort throughout the day. Whether you\'re heading to the office, attending a business meeting, or participating in a formal event, this shirt offers the perfect combination of elegance and practicality.</p><p>The refreshing sky blue color with fine white vertical stripes creates a timeless and professional look. The subtle stripe pattern adds a touch of sophistication without being overwhelming, making it suitable for professionals of all ages.</p><p>Made from premium-quality breathable fabric, this shirt keeps you comfortable even during long working hours. The lightweight material allows proper airflow, helping you stay cool and fresh throughout the day. The soft texture also feels gentle against the skin, making it ideal for daily wear.</p><p>Its slim-fit tailoring enhances your body shape while maintaining a polished appearance. The classic collar, premium button closure, and neatly finished cuffs reflect superior craftsmanship. Every stitch has been carefully completed to ensure durability and long-lasting performance.</p><p>One of the biggest advantages of this formal shirt is its versatility. Pair it with black trousers for a classic corporate look, navy pants for a modern business outfit, or beige chinos for a smart casual appearance. It also complements blazers, suits, ties, and leather shoes effortlessly.</p>','<p>একজন রুচিশীল পুরুষের পোশাকের সংগ্রহে একটি মানানসই ফরমাল শার্ট থাকা অপরিহার্য। এই প্রিমিয়াম স্কাই ব্লু স্ট্রাইপ ফরমাল শার্টটি এমনভাবে তৈরি করা হয়েছে যা আপনাকে মার্জিত লুক দেওয়ার পাশাপাশি সারাদিন সর্বোচ্চ আরামও নিশ্চিত করবে। অফিসে যাওয়া, ব্যবসায়িক মিটিং বা কোনো আনুষ্ঠানিক অনুষ্ঠানে—সবক্ষেত্রেই এই শার্টটি আভিজাত্য ও উপযোগিতার এক চমৎকার সমন্বয়।</p><p><br></p><p>এর সতেজ আকাশী নীল রঙের ওপর সরু সাদা উল্লম্ব স্ট্রাইপ একটি কালজয়ী ও পেশাদার লুক তৈরি করে। স্ট্রাইপের সূক্ষ্ম নকশাটি শার্টটিতে আভিজাত্য যোগ করে কিন্তু তা কখনোই দৃষ্টিকটু বা অতিরিক্ত মনে হয় না; ফলে সব বয়সের পেশাজীবীদের জন্যই এটি মানানসই।</p><p><br></p><p>উন্নত মানের ও বাতাস চলাচলে সক্ষম (breathable) কাপড়ে তৈরি হওয়ায় দীর্ঘ সময় কাজ করার সময়ও আপনি এতে স্বাচ্ছন্দ্য বোধ করবেন। হালকা ওজনের এই কাপড়টি বাতাস চলাচলে সহায়তা করে, যা আপনাকে সারাদিন শীতল ও সতেজ রাখে। এর কোমল টেক্সচার ত্বকের ওপর আরামদায়ক অনুভূতি দেয়, তাই এটি প্রতিদিন ব্যবহারের জন্য আদর্শ।</p><p><br></p><p>এর স্লিম-ফিট কাটিং আপনার শারীরিক গঠনকে সুন্দরভাবে ফুটিয়ে তোলে এবং একই সাথে একটি পরিপাটি ও মার্জিত ভাব বজায় রাখে। ক্লাসিক কলার, প্রিমিয়াম মানের বোতাম এবং পরিচ্ছন্নভাবে তৈরি কাফ—সবকিছুতেই এর উন্নত কারুকার্য ফুটে ওঠে। দীর্ঘস্থায়ী ব্যবহারের নিশ্চয়তা দিতে প্রতিটি সেলাই অত্যন্ত যত্নসহকারে সম্পন্ন করা হয়েছে।</p><p><br></p><p>এই ফরমাল শার্টটির অন্যতম বড় সুবিধা হলো এর বহুমুখী ব্যবহারযোগ্যতা। ক্লাসিক কর্পোরেট লুকের জন্য কালো ট্রাউজার, আধুনিক ব্যবসায়িক সাজের জন্য নেভি ব্লু প্যান্ট কিংবা স্মার্ট ক্যাজুয়াল লুকের জন্য বেইজ রঙের চিনোস প্যান্টের সাথে এটি অনায়াসেই মানিয়ে যায়। এছাড়া ব্লেজার, স্যুট, টাই এবং চামড়ার জুতার সাথেও এটিখাঁটি খেজুর সরবরাহ করি।</p>','Men\'s Fashion','পুরুষদের ফ্যাশন'),('56792458-88c3-11f1-8cc1-28d0eaec4da6','প্রিমিয়াম নীল চেক কটন লুঙ্গি – আরামদায়ক ও ঐতিহ্যবাহী দৈনন্দিন পরিধান','premium-blue-check-cotton-lungi','প্রিমিয়াম নীল চেক কটন লুঙ্গি, নরম ও আরামদায়ক কটন কাপড়ে তৈরি। দৈনন্দিন ব্যবহার, নামাজ, ঘরে পরিধান এবং ঐতিহ্যবাহী অনুষ্ঠানের জন্য উপযুক্ত।','<p>বাংলাদেশের ঐতিহ্যবাহী ও জনপ্রিয় পোশাকগুলোর মধ্যে লুঙ্গি অন্যতম। ঘরে আরাম করে থাকার জন্য, নামাজ আদায়ের সময় কিংবা দৈনন্দিন ব্যবহারে একটি ভালো মানের লুঙ্গির বিকল্প নেই। এই <strong>প্রিমিয়াম নীল চেক কটন লুঙ্গি</strong> তৈরি করা হয়েছে এমনভাবে, যাতে আপনি একসঙ্গে পান সর্বোচ্চ আরাম, টেকসই মান এবং আকর্ষণীয় ডিজাইন।</p><p>লুঙ্গিটি উন্নত মানের কটন ফেব্রিক দিয়ে তৈরি, যা অত্যন্ত নরম, হালকা এবং বাতাস চলাচল উপযোগী। ফলে গরমের দিনেও এটি পরিধানে আরামদায়ক অনুভূতি দেয়। দীর্ঘ সময় ব্যবহার করলেও শরীরে অস্বস্তি সৃষ্টি করে না এবং ত্বকের জন্যও নিরাপদ।</p><p>এর আকর্ষণীয় নীল চেক ডিজাইন লুঙ্গিটিকে দিয়েছে একটি মার্জিত ও ঐতিহ্যবাহী লুক। উন্নত মানের বুনন ও শক্ত সেলাইয়ের কারণে এটি দীর্ঘদিন ব্যবহার করা যায় এবং বারবার ধোয়ার পরও রঙ ও গুণগত মান বজায় থাকে।</p><p>এই লুঙ্গিটি ঘরে ব্যবহারের পাশাপাশি নামাজ, জুমার দিন, ঈদ, পারিবারিক অনুষ্ঠান কিংবা গ্রামের ঐতিহ্যবাহী পরিবেশ—সব ক্ষেত্রেই সমানভাবে উপযোগী। একটি সাদা গেঞ্জি, টি-শার্ট অথবা পাঞ্জাবির সঙ্গে এটি সহজেই মানিয়ে যায় এবং আপনাকে দেয় পরিচ্ছন্ন ও পরিপাটি একটি লুক।</p><h2>লুঙ্গিটির বিশেষ বৈশিষ্ট্য</h2><ul><li>প্রিমিয়াম মানের কটন ফেব্রিক</li><li>নরম ও আরামদায়ক কাপড়</li><li>বাতাস চলাচল উপযোগী ব্রিদেবল ম্যাটেরিয়াল</li><li>আকর্ষণীয় নীল চেক ডিজাইন</li><li>হালকা ও টেকসই</li><li>দীর্ঘদিন ব্যবহার উপযোগী</li><li>ত্বকবান্ধব ফেব্রিক</li><li>সহজে ধোয়া ও রক্ষণাবেক্ষণ করা যায়</li><li>রঙ দীর্ঘদিন উজ্জ্বল থাকে</li><li>নিখুঁত সেলাই ও উন্নত ফিনিশিং</li></ul><h2>যেসব ক্ষেত্রে ব্যবহার উপযোগী</h2><ul><li>দৈনন্দিন ব্যবহার</li><li>ঘরে পরিধান</li><li>নামাজ আদায়</li><li>জুমার দিন</li><li>ঈদ ও ধর্মীয় অনুষ্ঠান</li><li>পারিবারিক আড্ডা</li><li>ভ্রমণ</li><li>গরমের দিনে আরামদায়ক পোশাক হিসেবে</li></ul><h2>যত্নের নিয়ম</h2><ul><li>ঠান্ডা বা স্বাভাবিক পানিতে ধুয়ে নিন।</li><li>অতিরিক্ত ব্লিচ ব্যবহার করবেন না।</li><li>ছায়ায় শুকানো উত্তম।</li><li>প্রয়োজনে মাঝারি তাপমাত্রায় ইস্ত্রি করুন।</li><li>পরিষ্কার ও শুকনো স্থানে সংরক্ষণ করুন।</li></ul><p><br></p>','পুরুষদের ফ্যাশন','/backend/storage/uploads/site-settings/6soPNIDnK3PxMxbPs5C5FOS9PmDS5ShpiU0LSlit.webp',1,'2026-02-21 04:00:00','2026-07-26 01:52:47',NULL,'Premium Blue Check Cotton Lungi for Men – Comfortable Traditional Everyday Wear','প্রিমিয়াম নীল চেক কটন লুঙ্গি – আরামদায়ক ও ঐতিহ্যবাহী দৈনন্দিন পরিধান','Premium blue check cotton lungi made from soft breathable fabric. Comfortable, durable, and perfect for daily wear, home use, prayer, and traditional occasions.','প্রিমিয়াম নীল চেক কটন লুঙ্গি, নরম ও আরামদায়ক কটন কাপড়ে তৈরি। দৈনন্দিন ব্যবহার, নামাজ, ঘরে পরিধান এবং ঐতিহ্যবাহী অনুষ্ঠানের জন্য উপযুক্ত।','<p>The lungi has been a symbol of comfort and tradition for generations. This Premium Blue Check Cotton Lungi is thoughtfully designed for men who appreciate both style and everyday comfort. Whether you\'re relaxing at home, offering prayers, or attending traditional gatherings, this lungi ensures a perfect combination of softness, durability, and elegant design.</p><p>Crafted from high-quality cotton fabric, it provides excellent breathability and keeps you cool throughout the day. The lightweight material feels soft against the skin while maintaining long-lasting durability even after repeated washing.</p><p>Its attractive blue check pattern gives a timeless and sophisticated appearance that suits men of all ages. The carefully woven fabric ensures better strength, while the premium finishing enhances overall quality.</p><p>This lungi is easy to wear, easy to maintain, and suitable for daily use. Whether paired with a cotton T-shirt, panjabi, or casual shirt, it offers a neat and traditional look.</p><h3>Key Features</h3><ul><li>Premium quality cotton fabric</li><li>Soft and breathable material</li><li>Comfortable for all-day wear</li><li>Attractive blue check design</li><li>Lightweight and durable</li><li>Easy to wash and maintain</li><li>Skin-friendly fabric</li><li>Traditional and elegant appearance</li><li>Ideal for home and casual wear</li><li>Long-lasting color and stitching</li></ul><h3>Perfect For</h3><ul><li>Daily wear</li><li>Home use</li><li>Prayer</li><li>Friday prayers</li><li>Eid celebrations</li><li>Traditional occasions</li><li>Casual relaxation</li><li>Summer comfort</li></ul><h3>Care Instructions</h3><ul><li>Wash with cold or normal water.</li><li>Avoid strong bleach.</li><li>Dry in shade.</li><li>Iron on medium heat if needed.</li><li>Store in a clean and dry place.</li></ul><p>If you\'re looking for a comfortable, stylish, and durable lungi for everyday use, this Premium Blue Check Cotton Lungi is an excellent addition to your wardrobe.</p>','<p>বাংলাদেশের ঐতিহ্যবাহী ও জনপ্রিয় পোশাকগুলোর মধ্যে লুঙ্গি অন্যতম। ঘরে আরাম করে থাকার জন্য, নামাজ আদায়ের সময় কিংবা দৈনন্দিন ব্যবহারে একটি ভালো মানের লুঙ্গির বিকল্প নেই। এই <strong>প্রিমিয়াম নীল চেক কটন লুঙ্গি</strong> তৈরি করা হয়েছে এমনভাবে, যাতে আপনি একসঙ্গে পান সর্বোচ্চ আরাম, টেকসই মান এবং আকর্ষণীয় ডিজাইন।</p><p>লুঙ্গিটি উন্নত মানের কটন ফেব্রিক দিয়ে তৈরি, যা অত্যন্ত নরম, হালকা এবং বাতাস চলাচল উপযোগী। ফলে গরমের দিনেও এটি পরিধানে আরামদায়ক অনুভূতি দেয়। দীর্ঘ সময় ব্যবহার করলেও শরীরে অস্বস্তি সৃষ্টি করে না এবং ত্বকের জন্যও নিরাপদ।</p><p>এর আকর্ষণীয় নীল চেক ডিজাইন লুঙ্গিটিকে দিয়েছে একটি মার্জিত ও ঐতিহ্যবাহী লুক। উন্নত মানের বুনন ও শক্ত সেলাইয়ের কারণে এটি দীর্ঘদিন ব্যবহার করা যায় এবং বারবার ধোয়ার পরও রঙ ও গুণগত মান বজায় থাকে।</p><p>এই লুঙ্গিটি ঘরে ব্যবহারের পাশাপাশি নামাজ, জুমার দিন, ঈদ, পারিবারিক অনুষ্ঠান কিংবা গ্রামের ঐতিহ্যবাহী পরিবেশ—সব ক্ষেত্রেই সমানভাবে উপযোগী। একটি সাদা গেঞ্জি, টি-শার্ট অথবা পাঞ্জাবির সঙ্গে এটি সহজেই মানিয়ে যায় এবং আপনাকে দেয় পরিচ্ছন্ন ও পরিপাটি একটি লুক।</p><h2>লুঙ্গিটির বিশেষ বৈশিষ্ট্য</h2><ul><li>প্রিমিয়াম মানের কটন ফেব্রিক</li><li>নরম ও আরামদায়ক কাপড়</li><li>বাতাস চলাচল উপযোগী ব্রিদেবল ম্যাটেরিয়াল</li><li>আকর্ষণীয় নীল চেক ডিজাইন</li><li>হালকা ও টেকসই</li><li>দীর্ঘদিন ব্যবহার উপযোগী</li><li>ত্বকবান্ধব ফেব্রিক</li><li>সহজে ধোয়া ও রক্ষণাবেক্ষণ করা যায়</li><li>রঙ দীর্ঘদিন উজ্জ্বল থাকে</li><li>নিখুঁত সেলাই ও উন্নত ফিনিশিং</li></ul><h2>যেসব ক্ষেত্রে ব্যবহার উপযোগী</h2><ul><li>দৈনন্দিন ব্যবহার</li><li>ঘরে পরিধান</li><li>নামাজ আদায়</li><li>জুমার দিন</li><li>ঈদ ও ধর্মীয় অনুষ্ঠান</li><li>পারিবারিক আড্ডা</li><li>ভ্রমণ</li><li>গরমের দিনে আরামদায়ক পোশাক হিসেবে</li></ul><h2>যত্নের নিয়ম</h2><ul><li>ঠান্ডা বা স্বাভাবিক পানিতে ধুয়ে নিন।</li><li>অতিরিক্ত ব্লিচ ব্যবহার করবেন না।</li><li>ছায়ায় শুকানো উত্তম।</li><li>প্রয়োজনে মাঝারি তাপমাত্রায় ইস্ত্রি করুন।</li><li>পরিষ্কার ও শুকনো স্থানে সংরক্ষণ করুন।</li></ul><p><br></p>','Men\'s Fashion','পুরুষদের ফ্যাশন'),('5679282a-88c3-11f1-8cc1-28d0eaec4da6','প্রিমিয়াম সলিড গ্রে পুরুষদের টি-শার্ট – আরামদায়ক ও স্টাইলিশ দৈনন্দিন পোশাক','premium-solid-grey-mens-tshirt','প্রিমিয়াম সলিড গ্রে পুরুষদের টি-শার্ট, নরম ও আরামদায়ক কটন ফেব্রিকে তৈরি। দৈনন্দিন ব্যবহার, ভ্রমণ, জিম এবং ক্যাজুয়াল স্টাইলের জন্য আদর্শ।','<p>একটি ভালো মানের টি-শার্ট প্রতিটি পুরুষের দৈনন্দিন পোশাকের অন্যতম গুরুত্বপূর্ণ অংশ। এই <strong>প্রিমিয়াম সলিড গ্রে পুরুষদের টি-শার্ট</strong> এমনভাবে তৈরি করা হয়েছে, যাতে আপনি একই সঙ্গে পান সর্বোচ্চ আরাম, আধুনিক স্টাইল এবং দীর্ঘস্থায়ী ব্যবহারযোগ্যতা।</p><p>টি-শার্টটি উন্নত মানের নরম ও ব্রিদেবল কটন ফেব্রিক দিয়ে তৈরি, যা সারাদিন আরামদায়ক অনুভূতি দেয়। কাপড়টি হালকা হওয়ায় শরীরে বাতাস সহজে চলাচল করতে পারে এবং গরমের দিনেও আপনাকে সতেজ রাখে। ত্বকবান্ধব ফেব্রিক হওয়ায় দীর্ঘ সময় পরিধান করলেও অস্বস্তি সৃষ্টি করে না।</p><p>এর সলিড গ্রে রঙ একটি ক্লাসিক ও আধুনিক লুক প্রদান করে, যা সহজেই বিভিন্ন ধরনের পোশাকের সঙ্গে মানিয়ে যায়। আপনি এটি জিন্স, চিনোস, শর্টস কিংবা জগার্স—যেকোনো কিছুর সঙ্গে পরতে পারেন। ফলে এটি দৈনন্দিন ব্যবহার থেকে শুরু করে ক্যাজুয়াল আউটিং পর্যন্ত সব ক্ষেত্রেই উপযুক্ত।</p><p>ক্লাসিক রাউন্ড নেক ডিজাইন এবং আরামদায়ক ফিটিং আপনাকে দেয় একটি স্মার্ট ও পরিচ্ছন্ন লুক। উন্নত মানের সেলাই এবং শক্তিশালী ফিনিশিংয়ের কারণে টি-শার্টটি বারবার ধোয়ার পরও সহজে তার আকৃতি ও রঙ হারায় না।</p><h2>টি-শার্টটির বিশেষ বৈশিষ্ট্য</h2><ul><li>প্রিমিয়াম মানের নরম কটন ফেব্রিক</li><li>ব্রিদেবল ও হালকা কাপড়</li><li>স্টাইলিশ সলিড গ্রে রঙ</li><li>আরামদায়ক রেগুলার ফিট</li><li>ক্লাসিক রাউন্ড নেক ডিজাইন</li><li>ত্বকবান্ধব ফেব্রিক</li><li>টেকসই সেলাই</li><li>দীর্ঘদিন রঙ ও আকৃতি বজায় থাকে</li><li>সহজে ধোয়া ও রক্ষণাবেক্ষণ করা যায়</li><li>সব ঋতুতে পরিধান উপযোগী</li></ul><h2>যেসব ক্ষেত্রে ব্যবহার উপযোগী</h2><ul><li>দৈনন্দিন ব্যবহার</li><li>ক্যাজুয়াল আউটিং</li><li>অফিস ক্যাজুয়াল</li><li>কলেজ ও বিশ্ববিদ্যালয়</li><li>ভ্রমণ</li><li>জিম ও ফিটনেস</li><li>ঘরে আরামদায়ক পোশাক হিসেবে</li><li>বন্ধুদের সঙ্গে আড্ডা</li></ul><h2>যত্নের নিয়ম</h2><ul><li>ঠান্ডা বা স্বাভাবিক পানিতে ধুয়ে নিন।</li><li>অতিরিক্ত ব্লিচ ব্যবহার করবেন না।</li><li>ছায়ায় শুকান।</li><li>কম তাপমাত্রায় ইস্ত্রি করুন।</li><li>পরিষ্কার ও শুকনো স্থানে সংরক্ষণ করুন।</li></ul><p><br></p>','পুরুষদের ফ্যাশন','/backend/storage/uploads/site-settings/4JMxGqDh6IxezITpdbH4kU13I37hhLpFwG0Xgw2A.webp',1,'2026-02-14 04:00:00','2026-07-26 01:57:42',NULL,'Premium Solid Grey Men\'s T-Shirt – Soft Cotton Casual Wear for Everyday Comfort','প্রিমিয়াম সলিড গ্রে পুরুষদের টি-শার্ট – আরামদায়ক ও স্টাইলিশ দৈনন্দিন পোশাক','Shop our Premium Solid Grey Men\'s T-Shirt made from soft breathable cotton fabric. Lightweight, stylish, and perfect for daily wear, travel, gym, and casual outings.','প্রিমিয়াম সলিড গ্রে পুরুষদের টি-শার্ট, নরম ও আরামদায়ক কটন ফেব্রিকে তৈরি। দৈনন্দিন ব্যবহার, ভ্রমণ, জিম এবং ক্যাজুয়াল স্টাইলের জন্য আদর্শ।','<p>A quality T-shirt is one of the most essential pieces in every man\'s wardrobe. This Premium Solid Grey Men\'s T-Shirt is designed to provide the perfect balance of comfort, durability, and modern style for everyday use.</p><p>Made from premium-quality breathable cotton fabric, this T-shirt feels soft against the skin while allowing proper airflow throughout the day. The lightweight construction keeps you cool and comfortable, whether you\'re relaxing at home, working, traveling, or meeting friends.</p><p>Its elegant solid grey color offers a clean and versatile look that matches effortlessly with jeans, chinos, shorts, or joggers. The classic round neck and comfortable fit make it suitable for men of all ages.</p><p>The premium stitching ensures durability, while the high-quality fabric helps retain its shape and color even after repeated washing. Whether worn on its own or layered under a jacket or hoodie, this T-shirt delivers timeless casual style.</p><h3>Key Features</h3><ul><li>Premium soft cotton fabric</li><li>Breathable and lightweight</li><li>Stylish solid grey color</li><li>Comfortable regular fit</li><li>Classic round neck design</li><li>Skin-friendly material</li><li>Durable stitching</li><li>Fade-resistant fabric</li><li>Easy to wash and maintain</li><li>Suitable for all seasons</li></ul><h3>Perfect For</h3><ul><li>Daily wear</li><li>Casual outings</li><li>Office casual</li><li>Travel</li><li>Gym</li><li>Home wear</li><li>College</li><li>Weekend style</li></ul><h3>Care Instructions</h3><ul><li>Wash in cold water.</li><li>Do not use harsh bleach.</li><li>Dry in shade.</li><li>Iron at low temperature.</li><li>Store folded in a dry place.</li></ul><p><br></p>','<p>একটি ভালো মানের টি-শার্ট প্রতিটি পুরুষের দৈনন্দিন পোশাকের অন্যতম গুরুত্বপূর্ণ অংশ। এই <strong>প্রিমিয়াম সলিড গ্রে পুরুষদের টি-শার্ট</strong> এমনভাবে তৈরি করা হয়েছে, যাতে আপনি একই সঙ্গে পান সর্বোচ্চ আরাম, আধুনিক স্টাইল এবং দীর্ঘস্থায়ী ব্যবহারযোগ্যতা।</p><p>টি-শার্টটি উন্নত মানের নরম ও ব্রিদেবল কটন ফেব্রিক দিয়ে তৈরি, যা সারাদিন আরামদায়ক অনুভূতি দেয়। কাপড়টি হালকা হওয়ায় শরীরে বাতাস সহজে চলাচল করতে পারে এবং গরমের দিনেও আপনাকে সতেজ রাখে। ত্বকবান্ধব ফেব্রিক হওয়ায় দীর্ঘ সময় পরিধান করলেও অস্বস্তি সৃষ্টি করে না।</p><p>এর সলিড গ্রে রঙ একটি ক্লাসিক ও আধুনিক লুক প্রদান করে, যা সহজেই বিভিন্ন ধরনের পোশাকের সঙ্গে মানিয়ে যায়। আপনি এটি জিন্স, চিনোস, শর্টস কিংবা জগার্স—যেকোনো কিছুর সঙ্গে পরতে পারেন। ফলে এটি দৈনন্দিন ব্যবহার থেকে শুরু করে ক্যাজুয়াল আউটিং পর্যন্ত সব ক্ষেত্রেই উপযুক্ত।</p><p>ক্লাসিক রাউন্ড নেক ডিজাইন এবং আরামদায়ক ফিটিং আপনাকে দেয় একটি স্মার্ট ও পরিচ্ছন্ন লুক। উন্নত মানের সেলাই এবং শক্তিশালী ফিনিশিংয়ের কারণে টি-শার্টটি বারবার ধোয়ার পরও সহজে তার আকৃতি ও রঙ হারায় না।</p><h2>টি-শার্টটির বিশেষ বৈশিষ্ট্য</h2><ul><li>প্রিমিয়াম মানের নরম কটন ফেব্রিক</li><li>ব্রিদেবল ও হালকা কাপড়</li><li>স্টাইলিশ সলিড গ্রে রঙ</li><li>আরামদায়ক রেগুলার ফিট</li><li>ক্লাসিক রাউন্ড নেক ডিজাইন</li><li>ত্বকবান্ধব ফেব্রিক</li><li>টেকসই সেলাই</li><li>দীর্ঘদিন রঙ ও আকৃতি বজায় থাকে</li><li>সহজে ধোয়া ও রক্ষণাবেক্ষণ করা যায়</li><li>সব ঋতুতে পরিধান উপযোগী</li></ul><h2>যেসব ক্ষেত্রে ব্যবহার উপযোগী</h2><ul><li>দৈনন্দিন ব্যবহার</li><li>ক্যাজুয়াল আউটিং</li><li>অফিস ক্যাজুয়াল</li><li>কলেজ ও বিশ্ববিদ্যালয়</li><li>ভ্রমণ</li><li>জিম ও ফিটনেস</li><li>ঘরে আরামদায়ক পোশাক হিসেবে</li><li>বন্ধুদের সঙ্গে আড্ডা</li></ul><h2>যত্নের নিয়ম</h2><ul><li>ঠান্ডা বা স্বাভাবিক পানিতে ধুয়ে নিন।</li><li>অতিরিক্ত ব্লিচ ব্যবহার করবেন না।</li><li>ছায়ায় শুকান।</li><li>কম তাপমাত্রায় ইস্ত্রি করুন।</li><li>পরিষ্কার ও শুকনো স্থানে সংরক্ষণ করুন।</li></ul><p><br></p>','Men\'s Fashion','পুরুষদের ফ্যাশন');
/*!40000 ALTER TABLE `blogs` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `brands` (
  `id` char(36) NOT NULL,
  `name` text NOT NULL,
  `logo_url` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `name_en` text DEFAULT NULL,
  `name_bn` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `brands` WRITE;
/*!40000 ALTER TABLE `brands` DISABLE KEYS */;
/*!40000 ALTER TABLE `brands` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `id` char(36) NOT NULL,
  `name` text NOT NULL,
  `slug` varchar(255) NOT NULL,
  `image_url` text DEFAULT NULL,
  `parent_id` char(36) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `show_in_navbar` tinyint(1) NOT NULL DEFAULT 0,
  `show_on_home` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `name_en` text DEFAULT NULL,
  `name_bn` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`),
  KEY `categories_home_active_sort_idx` (`is_active`,`show_on_home`,`sort_order`),
  KEY `categories_nav_active_sort_idx` (`is_active`,`show_in_navbar`,`sort_order`),
  KEY `categories_parent_idx` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES ('034f3b23-7596-4e1a-8400-5b95b7a91d58','পোশাক','clothing','/assets/uploads/category-images/7pRKD4XPXOEG85pqtHS2Y6sGOz0OvRjx2y0h8O8N.webp',NULL,1,1,1,1,'2026-07-21 08:24:52','2026-07-21 08:24:53','Clothing','পোশাক'),('06ad5468-e37c-43b1-bac1-40529cf48921','শিশু','clothing-baby','/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u53.jpeg','034f3b23-7596-4e1a-8400-5b95b7a91d58',3,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','Baby','শিশু'),('0de82e19-70fa-41b8-863f-7797f0a59bfe','ঘড়ি','watches','/assets/uploads/category-images/aO4gO19MsMC1SXWdr0I0SOTTfE33LiKOxhksw2cJ.webp',NULL,3,1,1,1,'2026-07-21 08:24:52','2026-07-21 08:24:53','Watches','ঘড়ি'),('1148ec67-4236-4352-a129-dc138d6bbf68','ফুড ও অর্গানিক','food-organic','/assets/uploads/category-images/JgfETFxvabnvmuYSHW3Vor1tETXuic2HIi26QVnH.webp',NULL,6,1,1,1,'2026-07-21 08:24:52','2026-07-21 08:24:53','Food & Organic','ফুড ও অর্গানিক'),('1f6beccd-c992-4805-8e63-582f2d5b5bfc','বোরকা','clothing-women-burqa','/assets/uploads/product-images/fashion/elegant-beige-quilted-shoulder-bag.webp','e09a7142-b4a9-4e46-a71e-d348c7c242fa',2,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','Burqa','বোরকা'),('230d95a7-68a6-4aba-a991-6115107cc1fe','টি-শার্ট','clothing-men-tshirt','/assets/uploads/category-images/7pRKD4XPXOEG85pqtHS2Y6sGOz0OvRjx2y0h8O8N.webp','ecc2e3c7-dec2-40f8-8c88-2699725d0272',1,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','T-Shirt','টি-শার্ট'),('263e59a2-9bdb-4510-8e1a-0ea1b3ace159','শিশু','shoes-baby','/assets/uploads/category-images/shoes.jpg','7afb0a95-e9a7-4ad1-a9bd-fdf8afbbc17b',3,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','Baby','শিশু'),('2a73b178-e0b0-4173-8c1a-a40e3cacb7f3','হেলথকেয়ার ও সাপ্লিমেন্ট','healthcare-supplements','/assets/uploads/category-images/healthcare-supplements.jpg',NULL,7,1,1,1,'2026-07-21 08:24:52','2026-07-21 08:26:15','Healthcare & Supplements','হেলথকেয়ার ও সাপ্লিমেন্ট'),('379faa6f-9379-44cf-9db1-c83793ac069e','বেবি ড্রেস','clothing-baby-dress','/assets/uploads/product-images/fashion/elegant-beige-quilted-shoulder-bag.webp','06ad5468-e37c-43b1-bac1-40529cf48921',5,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','Baby Dress','বেবি ড্রেস'),('42c9cccc-7606-46b0-a398-31d5700bde4b','নাইট ড্রেস','clothing-women-night-dress','/assets/uploads/product-images/fashion/elegant-beige-quilted-shoulder-bag.webp','e09a7142-b4a9-4e46-a71e-d348c7c242fa',3,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','Night Dress','নাইট ড্রেস'),('5b3647c3-9f9c-4356-aee6-52caa830184d','স্পোর্টস','sports','/backend/storage/uploads/category-images/w5tWeKVH6VrAq8iC4XLjffX0MdfbWfXAgRdEhM53.webp',NULL,2,1,1,1,'2026-07-21 08:24:52','2026-07-28 04:35:03','Sports','স্পোর্টস'),('6107fa9d-04f4-40a8-aedc-c8bcda6d6eb5','প্যান্ট','clothing-men-pants','/assets/uploads/category-images/7pRKD4XPXOEG85pqtHS2Y6sGOz0OvRjx2y0h8O8N.webp','ecc2e3c7-dec2-40f8-8c88-2699725d0272',4,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','Pants','প্যান্ট'),('6b143829-dc22-4eaa-948b-00d202b700d0','শার্ট','clothing-men-shirt','/assets/uploads/category-images/7pRKD4XPXOEG85pqtHS2Y6sGOz0OvRjx2y0h8O8N.webp','ecc2e3c7-dec2-40f8-8c88-2699725d0272',3,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','Shirt','শার্ট'),('6fd8eab6-71e3-47dd-9d57-d822179d290c','স্পোর্টস ট্রাউজার','sports-trousers','/assets/uploads/category-images/sports.jpg','5b3647c3-9f9c-4356-aee6-52caa830184d',2,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','Sports Trousers','স্পোর্টস ট্রাউজার'),('757917d5-06fc-4977-9b08-f5d1a551d758','লুঙ্গি','clothing-men-lungi','/assets/uploads/category-images/7pRKD4XPXOEG85pqtHS2Y6sGOz0OvRjx2y0h8O8N.webp','ecc2e3c7-dec2-40f8-8c88-2699725d0272',2,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','Lungi','লুঙ্গি'),('7afb0a95-e9a7-4ad1-a9bd-fdf8afbbc17b','জুতা','shoes','/assets/uploads/category-images/shoes.jpg',NULL,8,1,1,1,'2026-07-21 08:24:52','2026-07-21 08:26:15','Shoes','জুতা'),('960fedc6-4b96-42f2-94a4-796e03f5fa0f','বেবি জুতা','clothing-baby-shoes','/assets/uploads/category-images/shoes.jpg','06ad5468-e37c-43b1-bac1-40529cf48921',2,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','Baby Shoes','বেবি জুতা'),('9832d1fc-8f3f-44c5-9ef1-1e0116c436ad','নবজাতক সেট','clothing-baby-newborn-set','/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u53.jpeg','06ad5468-e37c-43b1-bac1-40529cf48921',1,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','Newborn Set','নবজাতক সেট'),('98ff4184-0bc2-46eb-bdb9-090a5a9ea48b','রানিং শু','sports-running-shoes','/assets/uploads/category-images/sports.jpg','5b3647c3-9f9c-4356-aee6-52caa830184d',4,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','Running Shoes','রানিং শু'),('c9545279-4481-43ce-9847-d9b6cb82411c','খেলনা','clothing-baby-toys','/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u53.jpeg','06ad5468-e37c-43b1-bac1-40529cf48921',4,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','Toys','খেলনা'),('c9b25fb8-b8dc-4309-9a99-37a94e8a2526','কসমেটিকস','cosmetics','/assets/uploads/category-images/gm4s1HHVV5DSdQBDXDLgfbgA0jfiuNyqAX4sWHaK.webp',NULL,5,1,1,1,'2026-07-21 08:24:52','2026-07-21 08:24:53','Cosmetics','কসমেটিকস'),('d487b6b4-e5cf-42ee-816b-bc79e2c34eca','ইলেকট্রনিক্স ও হোম অ্যাপ্লায়েন্স','electronics-home-appliances','/assets/uploads/category-images/tb0sZw1DBYiSzq9Lv23vtVpaPFITlB0yBRUdfnly.webp',NULL,9,1,1,1,'2026-07-21 08:24:52','2026-07-21 08:24:53','Electronics & Home Appliances','ইলেকট্রনিক্স ও হোম অ্যাপ্লায়েন্স'),('d579d270-8012-454f-b502-f2ba696c7712','থ্রি-পিস','clothing-women-three-piece','/assets/uploads/product-images/fashion/elegant-beige-quilted-shoulder-bag.webp','e09a7142-b4a9-4e46-a71e-d348c7c242fa',4,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','Three-Piece','থ্রি-পিস'),('dedfbf7e-14e0-402b-88b3-42f936884b49','নারী','shoes-women','/assets/uploads/category-images/shoes.jpg','7afb0a95-e9a7-4ad1-a9bd-fdf8afbbc17b',2,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','Women','নারী'),('e09a7142-b4a9-4e46-a71e-d348c7c242fa','নারী','clothing-women','/assets/uploads/product-images/fashion/elegant-beige-quilted-shoulder-bag.webp','034f3b23-7596-4e1a-8400-5b95b7a91d58',2,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','Women','নারী'),('e765a2bc-5a60-40a1-89f9-5ca8aa37f5a4','জ্যাকেট','clothing-men-jackets','/assets/uploads/category-images/7pRKD4XPXOEG85pqtHS2Y6sGOz0OvRjx2y0h8O8N.webp','ecc2e3c7-dec2-40f8-8c88-2699725d0272',5,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','Jackets','জ্যাকেট'),('e83c5c5d-74d7-45b2-ba74-f4e8dd51c73b','গ্যাজেট','gadgets','/assets/uploads/category-images/F6WbpYZdE4km1cTZpO4DhQ61eZtCJLAkc24K2hO4.webp',NULL,4,1,1,1,'2026-07-21 08:24:52','2026-07-21 08:24:53','Gadgets','গ্যাজেট'),('ecc2e3c7-dec2-40f8-8c88-2699725d0272','পুরুষ','clothing-men','/assets/uploads/category-images/7pRKD4XPXOEG85pqtHS2Y6sGOz0OvRjx2y0h8O8N.webp','034f3b23-7596-4e1a-8400-5b95b7a91d58',1,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','Men','পুরুষ'),('ef025bce-1417-4a05-91c3-3754e9fef958','সালোয়ার কামিজ','clothing-women-salwar-kameez','/assets/uploads/product-images/fashion/elegant-beige-quilted-shoulder-bag.webp','e09a7142-b4a9-4e46-a71e-d348c7c242fa',1,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','Salwar Kameez','সালোয়ার কামিজ'),('efb2e0d8-c76e-4862-8c3d-d39340e35c6c','স্নিকার্স','sports-sneakers','/assets/uploads/category-images/sports.jpg','5b3647c3-9f9c-4356-aee6-52caa830184d',3,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','Sneakers','স্নিকার্স'),('f47cf9de-6d6c-4046-8c99-e433f62c24d4','ফিডিং বোতল','clothing-baby-feeding-bottle','/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u53.jpeg','06ad5468-e37c-43b1-bac1-40529cf48921',3,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','Feeding Bottle','ফিডিং বোতল'),('fc305213-ee82-4d73-9a38-d053da907108','জার্সি','sports-jersey','/assets/uploads/category-images/sports.jpg','5b3647c3-9f9c-4356-aee6-52caa830184d',1,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','Jersey','জার্সি'),('fd0b259c-a916-4530-b8b0-de7b0e5f7ff2','পুরুষ','shoes-men','/assets/uploads/category-images/shoes.jpg','7afb0a95-e9a7-4ad1-a9bd-fdf8afbbc17b',1,1,1,0,'2026-07-21 08:24:52','2026-07-21 08:24:53','Men','পুরুষ'),('ff9ff721-410c-4aba-898b-d4005aeef312','ব্যাগ','bags','/assets/uploads/category-images/upqkqSYFna5jOIJ4lng0UMHP5eNYctThw8lP2baG.webp',NULL,10,1,1,1,'2026-07-21 08:24:52','2026-07-21 08:24:53','Bags','ব্যাগ');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `coin_balances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `coin_balances` (
  `customer_id` char(36) NOT NULL,
  `available` int(11) NOT NULL DEFAULT 0,
  `pending` int(11) NOT NULL DEFAULT 0,
  `lifetime_earned` int(11) NOT NULL DEFAULT 0,
  `lifetime_redeemed` int(11) NOT NULL DEFAULT 0,
  `lifetime_expired` int(11) NOT NULL DEFAULT 0,
  `version` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `coin_balances` WRITE;
/*!40000 ALTER TABLE `coin_balances` DISABLE KEYS */;
/*!40000 ALTER TABLE `coin_balances` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `coin_reward_catalog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `coin_reward_catalog` (
  `id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `coin_cost` int(11) NOT NULL,
  `stock_limit` int(11) DEFAULT NULL,
  `redeemed_count` int(11) NOT NULL DEFAULT 0,
  `max_per_customer` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `starts_at` timestamp NULL DEFAULT NULL,
  `ends_at` timestamp NULL DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `coin_reward_catalog_is_active_sort_order_index` (`is_active`,`sort_order`),
  KEY `coin_reward_catalog_product_id_index` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `coin_reward_catalog` WRITE;
/*!40000 ALTER TABLE `coin_reward_catalog` DISABLE KEYS */;
/*!40000 ALTER TABLE `coin_reward_catalog` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `coin_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `coin_settings` (
  `id` char(36) NOT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `allow_checkout_redeem` tinyint(1) NOT NULL DEFAULT 0,
  `allow_product_redeem` tinyint(1) NOT NULL DEFAULT 0,
  `earn_coins_per_100` int(11) NOT NULL DEFAULT 5,
  `redeem_coins_per_taka` int(11) NOT NULL DEFAULT 100,
  `min_order_to_earn` decimal(10,2) NOT NULL DEFAULT 0.00,
  `max_coins_per_order` int(11) DEFAULT NULL,
  `min_balance_to_redeem` int(11) NOT NULL DEFAULT 0,
  `max_redeem_percent` int(11) NOT NULL DEFAULT 100,
  `expiry_months` int(11) DEFAULT NULL,
  `cooling_days` int(11) NOT NULL DEFAULT 0,
  `earn_on_discounted` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `coin_settings` WRITE;
/*!40000 ALTER TABLE `coin_settings` DISABLE KEYS */;
INSERT INTO `coin_settings` VALUES ('ddefb037-5282-4e3d-9c43-2641f5ed2565',1,1,1,100,100,200.00,2000,200,20,12,7,1,'2026-07-28 05:59:00','2026-07-28 07:02:58');
/*!40000 ALTER TABLE `coin_settings` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `coin_tiers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `coin_tiers` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_bn` varchar(255) DEFAULT NULL,
  `min_lifetime_coins` int(11) NOT NULL DEFAULT 0,
  `multiplier` decimal(4,2) NOT NULL DEFAULT 1.00,
  `icon` varchar(255) DEFAULT NULL,
  `color` varchar(255) NOT NULL DEFAULT '#f59e0b',
  `benefits` text DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `coin_tiers` WRITE;
/*!40000 ALTER TABLE `coin_tiers` DISABLE KEYS */;
INSERT INTO `coin_tiers` VALUES ('1aa7cae6-8b12-4aeb-a9a2-45f3d0517f2f','Gold','গোল্ড',20000,1.50,NULL,'#f59e0b',NULL,3,1,'2026-07-28 05:59:00','2026-07-28 05:59:00'),('45035474-8481-4468-96ba-7c3e01c99bca','Silver','সিলভার',5000,1.25,NULL,'#9ca3af',NULL,2,1,'2026-07-28 05:59:00','2026-07-28 05:59:00'),('e07bf262-574a-4d8b-bc21-d4337f9fae25','Bronze','ব্রোঞ্জ',0,1.00,NULL,'#cd7f32',NULL,1,1,'2026-07-28 05:59:00','2026-07-28 05:59:00');
/*!40000 ALTER TABLE `coin_tiers` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `coin_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `coin_transactions` (
  `id` char(36) NOT NULL,
  `customer_id` char(36) NOT NULL,
  `type` varchar(20) NOT NULL,
  `amount` int(11) NOT NULL,
  `balance_after` int(11) NOT NULL DEFAULT 0,
  `status` varchar(20) NOT NULL DEFAULT 'available',
  `consumed` int(11) NOT NULL DEFAULT 0,
  `source_type` varchar(30) DEFAULT NULL,
  `source_id` char(36) DEFAULT NULL,
  `order_id` char(36) DEFAULT NULL,
  `available_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `earn_rate_used` int(11) DEFAULT NULL,
  `redeem_rate_used` int(11) DEFAULT NULL,
  `multiplier_applied` decimal(4,2) NOT NULL DEFAULT 1.00,
  `idempotency_key` varchar(191) NOT NULL,
  `reverses_id` char(36) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `coin_transactions_idempotency_key_unique` (`idempotency_key`),
  KEY `coin_transactions_customer_id_created_at_index` (`customer_id`,`created_at`),
  KEY `coin_transactions_customer_id_status_index` (`customer_id`,`status`),
  KEY `coin_transactions_status_available_at_index` (`status`,`available_at`),
  KEY `coin_transactions_status_expires_at_index` (`status`,`expires_at`),
  KEY `coin_transactions_order_id_index` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `coin_transactions` WRITE;
/*!40000 ALTER TABLE `coin_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `coin_transactions` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `colors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `colors` (
  `id` char(36) NOT NULL,
  `name` text NOT NULL,
  `hex_code` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `name_en` text DEFAULT NULL,
  `name_bn` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `colors` WRITE;
/*!40000 ALTER TABLE `colors` DISABLE KEYS */;
/*!40000 ALTER TABLE `colors` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `coupons` (
  `id` char(36) NOT NULL,
  `code` varchar(255) NOT NULL,
  `discount_type` varchar(255) NOT NULL DEFAULT 'percentage',
  `discount_value` decimal(10,2) NOT NULL DEFAULT 0.00,
  `min_order_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `max_uses` int(11) DEFAULT NULL,
  `used_count` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `coupons_code_unique` (`code`),
  KEY `coupons_active_expires_idx` (`is_active`,`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES ('6ef8ee2b-be7d-4d88-91f0-53ee5621e144','sourov','percentage',100.00,1000.00,2,1,1,'2026-07-31 17:59:00','2026-07-28 06:44:07','2026-07-28 06:44:07');
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `courier_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `courier_settings` (
  `id` char(36) NOT NULL,
  `provider` varchar(255) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 0,
  `api_key` text DEFAULT NULL,
  `secret_key` text DEFAULT NULL,
  `base_url` text NOT NULL DEFAULT 'https://portal.packzy.com/api/v1',
  `last_balance` decimal(12,2) DEFAULT NULL,
  `last_checked_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `courier_settings_provider_unique` (`provider`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `courier_settings` WRITE;
/*!40000 ALTER TABLE `courier_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `courier_settings` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customers` (
  `id` char(36) NOT NULL,
  `name` text NOT NULL,
  `phone` text NOT NULL,
  `email` text DEFAULT NULL,
  `address` text DEFAULT NULL,
  `total_orders` int(11) NOT NULL DEFAULT 0,
  `total_spent` decimal(10,2) NOT NULL DEFAULT 0.00,
  `user_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customers_phone_unique` (`phone`) USING HASH
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES ('0989401d-ff94-479e-96b5-37c6eac3384f','S M Ruhul Amin','0176667666556','mohivislam2@gmail.com','40/B, Abdul Hadi Lane, Bangshal, Dhaka',2,8960.00,'1','2026-07-28 06:44:26','2026-07-28 07:25:28'),('8835d3a1-6529-4e50-8a69-0b3daa3d8e88','sourov','017663666638','mohivislam2@gmail.com','Dhaka',1,2460.00,'1','2026-07-28 06:22:41','2026-07-28 06:22:41'),('c05d1781-e508-4c09-a8df-c4236cf929c6','S M Ruhul Amin','4566466','lotusmostafiz@gmail.com','40/B, Abdul Hadi Lane, Bangshal, Dhaka',1,3020.00,'1','2026-07-29 06:50:13','2026-07-29 06:50:13'),('dbd6d2f8-b798-4acd-8b1a-727fb4012bcb','sourov','0174948494844','mohivislam2@gmail.com','sourov@gmail.com',1,1720.00,'1','2026-07-28 06:26:27','2026-07-28 06:26:27');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=109 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (63,'0001_01_01_000000_create_users_table',1),(64,'0001_01_01_000001_create_cache_table',1),(65,'0001_01_01_000002_create_jobs_table',1),(66,'2026_07_01_000000_create_organic_shop_tables',1),(67,'2026_07_01_112150_create_personal_access_tokens_table',1),(68,'2026_07_02_000000_add_checkout_fields_to_abandoned_carts',1),(69,'2026_07_03_000000_add_order_ip_and_blocked_customers',1),(70,'2026_07_04_000000_add_steadfast_courier_integration',1),(71,'2026_07_04_000000_create_bkash_settings_table',1),(72,'2026_07_04_100000_add_image_url_to_product_variants',1),(73,'2026_07_04_120000_create_blogs_and_videos_tables',1),(74,'2026_07_04_130000_add_focus_keyword_to_blogs',1),(75,'2026_07_04_140000_add_thumbnail_to_videos',1),(76,'2026_07_05_000000_add_tracking_tables',1),(77,'2026_07_06_000000_add_smtp_settings',1),(78,'2026_07_07_000000_add_performance_indexes',1),(79,'2026_07_08_000000_create_reviews_table',1),(80,'2026_07_08_100000_seed_feature_settings',1),(81,'2026_07_09_095037_add_bilingual_columns_to_tables',1),(82,'2026_07_19_170000_fix_storefront_product_categories',1),(83,'2026_07_19_171000_set_storefront_category_images',1),(84,'2026_07_19_172000_enforce_requested_category_structure',1),(85,'2026_07_19_173000_preserve_categories_and_product_assignments',1),(86,'2026_07_19_190000_add_products_to_empty_fashion_categories',1),(87,'2026_07_19_191000_normalize_fashion_category_images',1),(88,'2026_07_19_192000_add_more_perfume_and_water_bottle_products',1),(89,'2026_07_19_193000_add_uploaded_ladies_bag_products',1),(90,'2026_07_19_194000_add_uploaded_mans_bag_products',1),(91,'2026_07_19_195000_replace_homepage_hero_images',1),(92,'2026_07_21_000000_apply_dream_bazar_category_structure',1),(93,'2026_07_21_090802_update_category_images_to_existing_files',1),(94,'2026_07_21_091329_assign_images_to_current_categories',1),(95,'2026_07_21_100000_remove_empty_legacy_categories',1),(96,'2026_07_21_101500_fix_category_image_mismatches',1),(97,'2026_07_21_102500_set_remaining_category_images',1),(98,'2026_07_21_110000_add_placement_to_banners',1),(99,'2026_07_21_124050_add_images_to_all_categories',1),(100,'2026_07_21_130000_add_tshirt_products',1),(101,'2026_07_21_135000_add_lungi_products',1),(102,'2026_07_21_140000_add_shirt_products',1),(103,'2026_07_28_000000_create_coin_system_tables',2),(104,'2026_07_28_120000_add_coupon_code_to_orders',3),(105,'2026_07_28_120000_create_coin_reward_catalog',4),(106,'2026_07_29_100000_add_products_to_empty_categories',5),(107,'2026_07_29_120000_fill_category_product_gaps',6),(108,'2026_07_29_150000_add_requested_homepage_row_products',7);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_items` (
  `id` char(36) NOT NULL,
  `order_id` char(36) NOT NULL,
  `product_id` char(36) DEFAULT NULL,
  `product_name` text NOT NULL,
  `product_image` text DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL,
  `variant_info` text DEFAULT NULL,
  `is_reward` tinyint(1) NOT NULL DEFAULT 0,
  `reward_coins` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_idx` (`order_id`),
  KEY `order_items_product_idx` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES ('26985484-ea51-4a3d-831d-c155055599f1','4bb38582-221e-4748-9918-8f32117cf4c8','586e415d-9f54-4841-b4d2-2f08cbaac49c','Men\'s Golden Skeleton Dial Watch','/backend/storage/uploads/product-images/hvHXF8nmLPgkjqs8TAnWzI38hbfuE60rPCjGqQis.webp',1,2950.00,NULL,0,0,'2026-07-29 06:50:12','2026-07-29 06:50:12'),('4239820b-1dce-436b-a22c-96ef49a05eeb','972d82b4-561b-4101-abc9-44075c2f50de','b3000000-0000-4000-8000-000000000004','প্রিমিয়াম সিক্স-পিস হ্যান্ডব্যাগ সেট','/assets/uploads/product-images/ladies-bag/premium-six-piece-handbag-set.webp',2,2390.00,NULL,0,0,'2026-07-28 07:25:26','2026-07-28 07:25:26'),('609e18c9-71db-43da-986f-d12fe9fa4c9c','972d82b4-561b-4101-abc9-44075c2f50de','b2000000-0000-4000-8000-000000000005','রয়্যাল উদ ইও ডি পারফিউম ১০০ মি.লি.','/assets/uploads/product-images/fashion/royal-oud-eau-de-parfum-100ml.webp',1,1650.00,NULL,0,0,'2026-07-28 07:25:26','2026-07-28 07:25:26'),('77a58077-e7e0-43a1-80ea-0731f3114ba6','4642f3db-1267-4133-bc7f-272d0c8a579d','b3000000-0000-4000-8000-000000000004','প্রিমিয়াম সিক্স-পিস হ্যান্ডব্যাগ সেট','/assets/uploads/product-images/ladies-bag/premium-six-piece-handbag-set.webp',1,2390.00,NULL,0,0,'2026-07-28 06:22:40','2026-07-28 06:22:40'),('a33592da-9d09-4732-816c-b104c82c777c','eca97e87-48d3-4fa8-aa1c-26277bee8df1','b3000000-0000-4000-8000-000000000004','Premium Six-Piece Handbag Set','/assets/uploads/product-images/ladies-bag/premium-six-piece-handbag-set.webp',1,2390.00,NULL,0,0,'2026-07-28 06:44:25','2026-07-28 06:44:25'),('ded1dab6-ecef-477e-9aa2-d729ae4ad3ed','1f027caa-94ed-4229-b565-d0ebacc8864e','b2000000-0000-4000-8000-000000000005','Royal Oud Eau De Parfum 100ml','/assets/uploads/product-images/fashion/royal-oud-eau-de-parfum-100ml.webp',1,1650.00,NULL,0,0,'2026-07-28 06:26:26','2026-07-28 06:26:26');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `order_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_statuses` (
  `id` char(36) NOT NULL,
  `name` text NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `is_coin_earning` tinyint(1) NOT NULL DEFAULT 0,
  `is_coin_reversing` tinyint(1) NOT NULL DEFAULT 0,
  `color` text NOT NULL DEFAULT '#6b7280',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_statuses_name_unique` (`name`) USING HASH
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `order_statuses` WRITE;
/*!40000 ALTER TABLE `order_statuses` DISABLE KEYS */;
INSERT INTO `order_statuses` VALUES ('6467e7a9-8975-474b-8fca-79e79bf083fb','Completed','completed',1,0,'#10b981',6,'2026-07-21 08:55:15','2026-07-21 08:55:15'),('748a98a9-97ab-4b5a-9d73-8c35427c62ee','Cancelled','cancelled',0,1,'#6b7280',7,'2026-07-21 08:55:15','2026-07-21 08:55:15'),('92645672-f4aa-4d9d-813b-f220e396cabe','In Courier','in_courier',0,0,'#06b6d4',5,'2026-07-21 08:55:15','2026-07-21 08:55:15'),('c860a497-159c-4271-9c1e-1e7eeb5d04d3','Pending','pending',0,0,'#f59e0b',1,'2026-07-21 08:55:15','2026-07-21 08:55:15'),('d8a50150-a03f-491d-bb2c-61838711ef0a','Processing','processing',0,0,'#3b82f6',2,'2026-07-21 08:55:15','2026-07-21 08:55:15'),('ef87bf12-9fc4-4ec8-b693-76c6e74c1d8d','On The Way','on_the_way',0,0,'#8b5cf6',3,'2026-07-21 08:55:15','2026-07-21 08:55:15'),('f431602b-41b2-49f8-9638-1f1c8d86b34f','On Hold','on_hold',0,0,'#ef4444',4,'2026-07-21 08:55:15','2026-07-21 08:55:15');
/*!40000 ALTER TABLE `order_statuses` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` char(36) NOT NULL,
  `order_number` text NOT NULL,
  `customer_name` text NOT NULL,
  `customer_phone` text NOT NULL,
  `customer_email` text DEFAULT NULL,
  `customer_address` text NOT NULL,
  `delivery_area` text NOT NULL,
  `status_id` char(36) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `delivery_charge` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `coupon_code` varchar(255) DEFAULT NULL,
  `coins_earned` int(11) NOT NULL DEFAULT 0,
  `coins_redeemed` int(11) NOT NULL DEFAULT 0,
  `coin_discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `reward_coins` int(11) NOT NULL DEFAULT 0,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` text NOT NULL DEFAULT 'cod',
  `payment_status` text NOT NULL DEFAULT 'unpaid',
  `courier_provider` varchar(255) DEFAULT NULL,
  `courier_status` varchar(255) DEFAULT NULL,
  `courier_tracking_code` varchar(255) DEFAULT NULL,
  `courier_consignment_id` varchar(255) DEFAULT NULL,
  `courier_order_id` varchar(255) DEFAULT NULL,
  `courier_sent_at` timestamp NULL DEFAULT NULL,
  `courier_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`courier_response`)),
  `notes` text DEFAULT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `customer_ip` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `bkash_payment_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_order_number_unique` (`order_number`) USING HASH,
  KEY `orders_bkash_payment_id_index` (`bkash_payment_id`),
  KEY `orders_status_created_idx` (`status_id`,`created_at`),
  KEY `orders_user_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES ('1f027caa-94ed-4229-b565-d0ebacc8864e','ORD-1785241585153','sourov','0174948494844','mohivislam2@gmail.com','sourov@gmail.com','ঢাকার ভিতরে','c860a497-159c-4271-9c1e-1e7eeb5d04d3',1650.00,70.00,0.00,NULL,0,0,0.00,0,1720.00,'cod','unpaid',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1','127.0.0.1','2026-07-28 06:26:26','2026-07-28 06:26:26',NULL),('4642f3db-1267-4133-bc7f-272d0c8a579d','ORD-1785241359238','sourov','017663666638','mohivislam2@gmail.com','Dhaka','ঢাকার ভিতরে','c860a497-159c-4271-9c1e-1e7eeb5d04d3',2390.00,70.00,0.00,NULL,0,0,0.00,0,2460.00,'cod','unpaid',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1','127.0.0.1','2026-07-28 06:22:40','2026-07-28 06:22:40',NULL),('4bb38582-221e-4748-9918-8f32117cf4c8','ORD-1785329408967','S M Ruhul Amin','4566466','lotusmostafiz@gmail.com','40/B, Abdul Hadi Lane, Bangshal, Dhaka','ঢাকার ভিতরে','c860a497-159c-4271-9c1e-1e7eeb5d04d3',2950.00,70.00,0.00,NULL,0,0,0.00,0,3020.00,'cod','unpaid',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1','127.0.0.1','2026-07-29 06:50:11','2026-07-29 06:50:11',NULL),('972d82b4-561b-4101-abc9-44075c2f50de','ORD-1785245125090','S M Ruhul Amin','0176667666556','mohivislam2@gmail.com','40/B, Abdul Hadi Lane, Bangshal, Dhaka','ঢাকার ভিতরে','c860a497-159c-4271-9c1e-1e7eeb5d04d3',6430.00,70.00,0.00,NULL,0,0,0.00,0,6500.00,'cod','unpaid',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1','127.0.0.1','2026-07-28 07:25:26','2026-07-28 07:25:26',NULL),('eca97e87-48d3-4fa8-aa1c-26277bee8df1','ORD-1785242664306','S M Ruhul Amin','0176667666556','mohivislam2@gmail.com','40/B, Abdul Hadi Lane, Bangshal, Dhaka','ঢাকার ভিতরে','c860a497-159c-4271-9c1e-1e7eeb5d04d3',2390.00,70.00,2390.00,'sourov',0,0,0.00,0,70.00,'cod','unpaid',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1','127.0.0.1','2026-07-28 06:44:25','2026-07-28 06:44:27',NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pages` (
  `id` char(36) NOT NULL,
  `title` text NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` longtext DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `title_en` text DEFAULT NULL,
  `title_bn` text DEFAULT NULL,
  `content_en` longtext DEFAULT NULL,
  `content_bn` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pages_slug_unique` (`slug`),
  KEY `pages_active_idx` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;
/*!40000 ALTER TABLE `pages` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',1,'react-spa','dc5a12b4d40a45328660a6f44cac20b49e725161febac30a362bd3031b197a4b','[\"*\"]','2026-07-21 08:57:01',NULL,'2026-07-21 08:56:59','2026-07-21 08:57:01'),(2,'App\\Models\\User',1,'react-spa','b615a745a79bd258382b44ca0136c39a7bdcb84b8b0898f7fff1c73ea26fcb50','[\"*\"]','2026-07-26 03:06:29',NULL,'2026-07-26 01:07:57','2026-07-26 03:06:29'),(3,'App\\Models\\User',1,'react-spa','7d3ce2e79306b5e926743f9b6389eadc99c05a6a5d37949fb7ea0a733e2dda3f','[\"*\"]','2026-07-29 03:00:20',NULL,'2026-07-28 04:22:51','2026-07-29 03:00:20'),(4,'App\\Models\\User',2,'react-spa','24c54de6b6b29c58cde14594aa5fb9318ee20cf93eb9163bdad084d71371e11d','[\"*\"]',NULL,NULL,'2026-07-28 07:19:32','2026-07-28 07:19:32'),(5,'App\\Models\\User',1,'react-spa','4fde52331a00f1b4289af672eb18fadffd4b00d2e4ffd31b983f2b337c8dc69b','[\"*\"]',NULL,NULL,'2026-07-29 06:15:29','2026-07-29 06:15:29'),(6,'App\\Models\\User',1,'react-spa','4cff2302f9d8f7e331e2384f782ee80d5c2873bd1492e0762957d3f5dc4638c1','[\"*\"]','2026-07-29 08:07:49',NULL,'2026-07-29 06:16:30','2026-07-29 08:07:49');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_variants` (
  `id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `color_id` char(36) DEFAULT NULL,
  `size_id` char(36) DEFAULT NULL,
  `sku` text DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `variants_product_active_created_idx` (`product_id`,`is_active`,`created_at`),
  KEY `variants_size_idx` (`size_id`),
  KEY `variants_color_idx` (`color_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `id` char(36) NOT NULL,
  `name` text NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `short_description` text DEFAULT NULL,
  `base_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `sale_price` decimal(10,2) DEFAULT NULL,
  `purchase_price` decimal(10,2) DEFAULT NULL,
  `sku` text DEFAULT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `category_id` char(36) DEFAULT NULL,
  `brand_id` char(36) DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `weight` text DEFAULT NULL,
  `unit` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `name_en` text DEFAULT NULL,
  `name_bn` text DEFAULT NULL,
  `short_description_en` text DEFAULT NULL,
  `short_description_bn` text DEFAULT NULL,
  `description_en` longtext DEFAULT NULL,
  `description_bn` longtext DEFAULT NULL,
  `weight_en` varchar(255) DEFAULT NULL,
  `weight_bn` varchar(255) DEFAULT NULL,
  `unit_en` varchar(255) DEFAULT NULL,
  `unit_bn` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_slug_unique` (`slug`),
  KEY `products_active_category_created_idx` (`is_active`,`category_id`,`created_at`),
  KEY `products_active_featured_created_idx` (`is_active`,`is_featured`,`created_at`),
  KEY `products_category_idx` (`category_id`),
  KEY `products_brand_idx` (`brand_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES ('012ae9ec-3df9-4c56-bfe1-f75da808ce6c','অর্গানিক খেজুর গুড় ১ কেজি','organic-date-molasses-1kg','অর্গানিক খেজুর গুড় ১ কেজি। বিশ্বস্ত স্থানীয় উৎপাদকদের কাছ থেকে সরাসরি সংগ্রহ করা খাঁটি ও কেমিক্যালমুক্ত অর্গানিক খাদ্যপণ্য।','বিশ্বস্ত স্থানীয় উৎপাদকদের কাছ থেকে সরাসরি সংগ্রহ করা খাঁটি ও কেমিক্যালমুক্ত অর্গানিক খাদ্যপণ্য।',650.00,570.00,NULL,NULL,35,'1148ec67-4236-4352-a129-dc138d6bbf68',NULL,'/backend/storage/uploads/product-images/DpBZ7uFGJqoALismd6RGvqkeWyCSApZiTfkxcTVp.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:11:15','Organic Date Molasses 1kg','অর্গানিক খেজুর গুড় ১ কেজি','Pure, chemical-free organic food item sourced directly from trusted local producers.','বিশ্বস্ত স্থানীয় উৎপাদকদের কাছ থেকে সরাসরি সংগ্রহ করা খাঁটি ও কেমিক্যালমুক্ত অর্গানিক খাদ্যপণ্য।','Organic Date Molasses 1kg. Pure, chemical-free organic food item sourced directly from trusted local producers.','অর্গানিক খেজুর গুড় ১ কেজি। বিশ্বস্ত স্থানীয় উৎপাদকদের কাছ থেকে সরাসরি সংগ্রহ করা খাঁটি ও কেমিক্যালমুক্ত অর্গানিক খাদ্যপণ্য।',NULL,NULL,NULL,NULL),('01c3bc0e-321a-406c-9e6b-7cd92d110377','পুরুষদের আউটডোর হাইকিং বুট','mens-outdoor-hiking-boots','পুরুষদের আউটডোর হাইকিং বুট। কুশনড ইনসোল ও মজবুত গ্রিপ আউটসোলের টেকসই পুরুষদের জুতা, সারাদিন আরামদায়ক।','কুশনড ইনসোল ও মজবুত গ্রিপ আউটসোলের টেকসই পুরুষদের জুতা, সারাদিন আরামদায়ক।',3250.00,2890.00,NULL,NULL,20,'fd0b259c-a916-4530-b8b0-de7b0e5f7ff2',NULL,'/backend/storage/uploads/product-images/xRGyIyiLSNALzFQwLJAQnOsjdPENOfzR4iLCqFpV.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:12:07','Men\'s Outdoor Hiking Boots','পুরুষদের আউটডোর হাইকিং বুট','Durable men\'s footwear with a cushioned insole and firm grip outsole for all-day comfort.','কুশনড ইনসোল ও মজবুত গ্রিপ আউটসোলের টেকসই পুরুষদের জুতা, সারাদিন আরামদায়ক।','Men\'s Outdoor Hiking Boots. Durable men\'s footwear with a cushioned insole and firm grip outsole for all-day comfort.','পুরুষদের আউটডোর হাইকিং বুট। কুশনড ইনসোল ও মজবুত গ্রিপ আউটসোলের টেকসই পুরুষদের জুতা, সারাদিন আরামদায়ক।',NULL,NULL,NULL,NULL),('02964ca8-c327-4f14-ba11-7e7e3dba7e84','১০০০০ এমএএইচ ফাস্ট চার্জিং পাওয়ার ব্যাংক','10000mah-fast-charging-power-bank','১০০০০ এমএএইচ ফাস্ট চার্জিং পাওয়ার ব্যাংক। নির্ভরযোগ্য বিল্ড কোয়ালিটির প্রয়োজনীয় দৈনন্দিন গ্যাজেট, স্ট্যান্ডার্ড ওয়ারেন্টি সহ।','নির্ভরযোগ্য বিল্ড কোয়ালিটির প্রয়োজনীয় দৈনন্দিন গ্যাজেট, স্ট্যান্ডার্ড ওয়ারেন্টি সহ।',1450.00,1290.00,NULL,NULL,45,'e83c5c5d-74d7-45b2-ba74-f4e8dd51c73b',NULL,'/backend/storage/uploads/product-images/HvHSllDuYbZD3mJR6HaZDQbDL3D2pqB5b21X5vzk.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:08:56','10000mAh Fast Charging Power Bank','১০০০০ এমএএইচ ফাস্ট চার্জিং পাওয়ার ব্যাংক','Handy everyday gadget with reliable build quality and a standard warranty.','নির্ভরযোগ্য বিল্ড কোয়ালিটির প্রয়োজনীয় দৈনন্দিন গ্যাজেট, স্ট্যান্ডার্ড ওয়ারেন্টি সহ।','10000mAh Fast Charging Power Bank. Handy everyday gadget with reliable build quality and a standard warranty.','১০০০০ এমএএইচ ফাস্ট চার্জিং পাওয়ার ব্যাংক। নির্ভরযোগ্য বিল্ড কোয়ালিটির প্রয়োজনীয় দৈনন্দিন গ্যাজেট, স্ট্যান্ডার্ড ওয়ারেন্টি সহ।',NULL,NULL,NULL,NULL),('0375134d-6189-4cd1-98c7-c287f3aa58c6','ক্লাসিক ব্ল্যাক ফরমাল প্যান্ট','classic-black-formal-pant','ক্লাসিক ব্ল্যাক ফরমাল প্যান্ট। আরামদায়ক দৈনন্দিন পুরুষদের প্যান্ট, পরিচ্ছন্ন কাট ও টেকসই সেলাই। সব স্ট্যান্ডার্ড সাইজে পাওয়া যাচ্ছে।','আরামদায়ক দৈনন্দিন পুরুষদের প্যান্ট, পরিচ্ছন্ন কাট ও টেকসই সেলাই। সব স্ট্যান্ডার্ড সাইজে পাওয়া যাচ্ছে।',1450.00,1290.00,NULL,NULL,40,'6107fa9d-04f4-40a8-aedc-c8bcda6d6eb5',NULL,'/backend/storage/uploads/product-images/c8W9O6upPcBBbJX1iMbMUGdHdXWcqMLq8Qprcy5C.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:13:00','Classic Black Formal Pant','ক্লাসিক ব্ল্যাক ফরমাল প্যান্ট','Comfortable everyday men\'s pant with a clean cut and durable stitching. Available in all standard sizes.','আরামদায়ক দৈনন্দিন পুরুষদের প্যান্ট, পরিচ্ছন্ন কাট ও টেকসই সেলাই। সব স্ট্যান্ডার্ড সাইজে পাওয়া যাচ্ছে।','Classic Black Formal Pant. Comfortable everyday men\'s pant with a clean cut and durable stitching. Available in all standard sizes.','ক্লাসিক ব্ল্যাক ফরমাল প্যান্ট। আরামদায়ক দৈনন্দিন পুরুষদের প্যান্ট, পরিচ্ছন্ন কাট ও টেকসই সেলাই। সব স্ট্যান্ডার্ড সাইজে পাওয়া যাচ্ছে।',NULL,NULL,NULL,NULL),('04184216-fd50-4298-a5c2-2a755511dc55','ইকো টিল ভ্যাকুয়াম ফ্লাস্ক ৫০০ মিলি','eco-teal-vacuum-flask-500ml-1785054473081','ইনসুলেটেড স্টিল বডি, লিক-রেজিস্ট্যান্ট ব্যাম্বু-ফিনিশ ক্যাপ ও সহজে বহনযোগ্য মেটাল লুপসহ স্টাইলিশ কমপ্যাক্ট ফ্লাস্ক।','ইনসুলেটেড স্টিল বডি, লিক-রেজিস্ট্যান্ট ব্যাম্বু-ফিনিশ ক্যাপ ও সহজে বহনযোগ্য মেটাল লুপসহ স্টাইলিশ কমপ্যাক্ট ফ্লাস্ক।',850.00,690.00,690.00,'Flask',20,'d487b6b4-e5cf-42ee-816b-bc79e2c34eca',NULL,'/backend/storage/uploads/product-images/E7FlR22kH6XjMq5EPQ95zCFMo50NMjxFBXgfnpVT.webp','[]',1,0,'100','গ্রাম','2026-07-26 02:27:53','2026-07-26 02:27:53','Eco Teal Vacuum Flask 500ml','ইকো টিল ভ্যাকুয়াম ফ্লাস্ক ৫০০ মিলি','A stylish compact vacuum flask with an insulated steel body, leak-resistant bamboo-finish cap and easy-carry metal loop.','ইনসুলেটেড স্টিল বডি, লিক-রেজিস্ট্যান্ট ব্যাম্বু-ফিনিশ ক্যাপ ও সহজে বহনযোগ্য মেটাল লুপসহ স্টাইলিশ কমপ্যাক্ট ফ্লাস্ক।','A stylish compact vacuum flask with an insulated steel body, leak-resistant bamboo-finish cap and easy-carry metal loop.','ইনসুলেটেড স্টিল বডি, লিক-রেজিস্ট্যান্ট ব্যাম্বু-ফিনিশ ক্যাপ ও সহজে বহনযোগ্য মেটাল লুপসহ স্টাইলিশ কমপ্যাক্ট ফ্লাস্ক।','100','100','gm','গ্রাম'),('068cbe83-d40e-4289-b3ad-43540770f0ee','নারীদের এমব্রয়ডারি খুসা','womens-embroidered-khussa','নারীদের এমব্রয়ডারি খুসা। নরম ফুটবেড ও ব্যালান্সড হিলের স্টাইলিশ নারীদের জুতা, দীর্ঘক্ষণ পরে থাকতে আরামদায়ক।','নরম ফুটবেড ও ব্যালান্সড হিলের স্টাইলিশ নারীদের জুতা, দীর্ঘক্ষণ পরে থাকতে আরামদায়ক।',1350.00,1190.00,NULL,NULL,30,'dedfbf7e-14e0-402b-88b3-42f936884b49',NULL,'/backend/storage/uploads/product-images/lXv0bg6y6fTs5z9Rx87prrWbBWrfPnRrzLO2zqXr.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:13:48','Women\'s Embroidered Khussa','নারীদের এমব্রয়ডারি খুসা','Stylish women\'s footwear with a soft footbed and balanced heel for comfortable long wear.','নরম ফুটবেড ও ব্যালান্সড হিলের স্টাইলিশ নারীদের জুতা, দীর্ঘক্ষণ পরে থাকতে আরামদায়ক।','Women\'s Embroidered Khussa. Stylish women\'s footwear with a soft footbed and balanced heel for comfortable long wear.','নারীদের এমব্রয়ডারি খুসা। নরম ফুটবেড ও ব্যালান্সড হিলের স্টাইলিশ নারীদের জুতা, দীর্ঘক্ষণ পরে থাকতে আরামদায়ক।',NULL,NULL,NULL,NULL),('0a52c8f2-4dff-411e-bf2a-3a1553074453','সিম্পল ডেইলি ওয়্যার আবায়া বোরকা','simple-daily-wear-abaya-burqa','সিম্পল ডেইলি ওয়্যার আবায়া বোরকা। হালকা ও আরামদায়ক ফিটের মার্জিত বোরকা, প্রতিদিনের ব্যবহারের জন্য মানসম্মত ফিনিশিং।','হালকা ও আরামদায়ক ফিটের মার্জিত বোরকা, প্রতিদিনের ব্যবহারের জন্য মানসম্মত ফিনিশিং।',1650.00,1490.00,NULL,NULL,45,'1f6beccd-c992-4805-8e63-582f2d5b5bfc',NULL,'/backend/storage/uploads/product-images/rMMNwxrFKZLKS0p3IzbOlSoVkDYy7iNrABkE5b0e.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:14:47','Simple Daily Wear Abaya Burqa','সিম্পল ডেইলি ওয়্যার আবায়া বোরকা','Modest, lightweight burqa with a comfortable fit and quality finishing for everyday use.','হালকা ও আরামদায়ক ফিটের মার্জিত বোরকা, প্রতিদিনের ব্যবহারের জন্য মানসম্মত ফিনিশিং।','Simple Daily Wear Abaya Burqa. Modest, lightweight burqa with a comfortable fit and quality finishing for everyday use.','সিম্পল ডেইলি ওয়্যার আবায়া বোরকা। হালকা ও আরামদায়ক ফিটের মার্জিত বোরকা, প্রতিদিনের ব্যবহারের জন্য মানসম্মত ফিনিশিং।',NULL,NULL,NULL,NULL),('0acd845b-7f28-4f30-b1dc-efee3c7089bb','ব্লক প্রিন্ট কটন সালোয়ার কামিজ','block-print-cotton-salwar-kameez','ব্লক প্রিন্ট কটন সালোয়ার কামিজ। নরম ও আরামদায়ক কাপড়ের মার্জিত সালোয়ার কামিজ সেট — প্রতিদিনের ব্যবহার ও অনুষ্ঠান দুটোতেই মানানসই।','নরম ও আরামদায়ক কাপড়ের মার্জিত সালোয়ার কামিজ সেট — প্রতিদিনের ব্যবহার ও অনুষ্ঠান দুটোতেই মানানসই।',1750.00,1550.00,NULL,NULL,35,'ef025bce-1417-4a05-91c3-3754e9fef958',NULL,'/backend/storage/uploads/product-images/PRVXQK6yud7UkQH2TmvPhrBBVXik1cHVkYUcaVAN.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:16:39','Block Print Cotton Salwar Kameez','ব্লক প্রিন্ট কটন সালোয়ার কামিজ','Elegant salwar kameez set with soft, breathable fabric — comfortable for daily wear and occasions.','নরম ও আরামদায়ক কাপড়ের মার্জিত সালোয়ার কামিজ সেট — প্রতিদিনের ব্যবহার ও অনুষ্ঠান দুটোতেই মানানসই।','Block Print Cotton Salwar Kameez. Elegant salwar kameez set with soft, breathable fabric — comfortable for daily wear and occasions.','ব্লক প্রিন্ট কটন সালোয়ার কামিজ। নরম ও আরামদায়ক কাপড়ের মার্জিত সালোয়ার কামিজ সেট — প্রতিদিনের ব্যবহার ও অনুষ্ঠান দুটোতেই মানানসই।',NULL,NULL,NULL,NULL),('0c2ad65a-82ff-4525-a2fb-362fa196de7a','ট্রেইল রানিং সু','trail-running-shoes','ট্রেইল রানিং সু। হালকা ওজনের রানিং সু, রেসপন্সিভ কুশনিং সহ — প্রতিদিনের দৌড় ও লং ডিসট্যান্সের জন্য।','হালকা ওজনের রানিং সু, রেসপন্সিভ কুশনিং সহ — প্রতিদিনের দৌড় ও লং ডিসট্যান্সের জন্য।',2950.00,2650.00,NULL,NULL,20,'98ff4184-0bc2-46eb-bdb9-090a5a9ea48b',NULL,'/backend/storage/uploads/product-images/ANOyKJWyGn3FQIRSAFqsBzku9mGtfwDRSWdVM2Bd.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:15:41','Trail Running Shoes','ট্রেইল রানিং সু','Lightweight running shoes with responsive cushioning for daily runs and long distance.','হালকা ওজনের রানিং সু, রেসপন্সিভ কুশনিং সহ — প্রতিদিনের দৌড় ও লং ডিসট্যান্সের জন্য।','Trail Running Shoes. Lightweight running shoes with responsive cushioning for daily runs and long distance.','ট্রেইল রানিং সু। হালকা ওজনের রানিং সু, রেসপন্সিভ কুশনিং সহ — প্রতিদিনের দৌড় ও লং ডিসট্যান্সের জন্য।',NULL,NULL,NULL,NULL),('0ff057dd-8f34-4f06-a0d2-bb76f1d0368d','পুরুষদের ম্যারাথন রানিং সু','mens-marathon-running-shoes','পুরুষদের ম্যারাথন রানিং সু। হালকা ওজনের রানিং সু, রেসপন্সিভ কুশনিং সহ — প্রতিদিনের দৌড় ও লং ডিসট্যান্সের জন্য।','হালকা ওজনের রানিং সু, রেসপন্সিভ কুশনিং সহ — প্রতিদিনের দৌড় ও লং ডিসট্যান্সের জন্য।',2650.00,2350.00,NULL,NULL,25,'98ff4184-0bc2-46eb-bdb9-090a5a9ea48b',NULL,'/backend/storage/uploads/product-images/WrJWvk3kloWuqrKLxyz3bsjIeckPgytLFq4WmGCD.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:17:23','Men\'s Marathon Running Shoes','পুরুষদের ম্যারাথন রানিং সু','Lightweight running shoes with responsive cushioning for daily runs and long distance.','হালকা ওজনের রানিং সু, রেসপন্সিভ কুশনিং সহ — প্রতিদিনের দৌড় ও লং ডিসট্যান্সের জন্য।','Men\'s Marathon Running Shoes. Lightweight running shoes with responsive cushioning for daily runs and long distance.','পুরুষদের ম্যারাথন রানিং সু। হালকা ওজনের রানিং সু, রেসপন্সিভ কুশনিং সহ — প্রতিদিনের দৌড় ও লং ডিসট্যান্সের জন্য।',NULL,NULL,NULL,NULL),('0ff6e34c-afb8-4740-9de5-27e5ee2a671c','বেবি পার্টি ওয়্যার টুটু ড্রেস','baby-party-wear-tutu-dress','বেবি পার্টি ওয়্যার টুটু ড্রেস। নরম কটনে তৈরি আরামদায়ক ও সুন্দর বেবি ড্রেস, শিশুর কোমল ত্বকের জন্য নিরাপদ।','নরম কটনে তৈরি আরামদায়ক ও সুন্দর বেবি ড্রেস, শিশুর কোমল ত্বকের জন্য নিরাপদ।',1250.00,1090.00,NULL,NULL,28,'379faa6f-9379-44cf-9db1-c83793ac069e',NULL,'/backend/storage/uploads/product-images/TwNW7gGRAxX76u9Le5sPHsfDNTGJx49ToJbWGSbQ.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:18:17','Baby Party Wear Tutu Dress','বেবি পার্টি ওয়্যার টুটু ড্রেস','Cute, breathable baby dress made from soft cotton that is gentle on delicate skin.','নরম কটনে তৈরি আরামদায়ক ও সুন্দর বেবি ড্রেস, শিশুর কোমল ত্বকের জন্য নিরাপদ।','Baby Party Wear Tutu Dress. Cute, breathable baby dress made from soft cotton that is gentle on delicate skin.','বেবি পার্টি ওয়্যার টুটু ড্রেস। নরম কটনে তৈরি আরামদায়ক ও সুন্দর বেবি ড্রেস, শিশুর কোমল ত্বকের জন্য নিরাপদ।',NULL,NULL,NULL,NULL),('140bd2d2-052a-4a1b-8074-84ce0131340e','অ্যান্টি-স্লিপ বেবি স্নিকার্স','anti-slip-baby-sneakers','অ্যান্টি-স্লিপ বেবি স্নিকার্স। নরম সোল ও অ্যান্টি-স্লিপ গ্রিপের বেবি শু — ছোট্ট পায়ে হালকা এবং সহজে পরানো যায়।','নরম সোল ও অ্যান্টি-স্লিপ গ্রিপের বেবি শু — ছোট্ট পায়ে হালকা এবং সহজে পরানো যায়।',950.00,850.00,NULL,NULL,38,'960fedc6-4b96-42f2-94a4-796e03f5fa0f',NULL,'/backend/storage/uploads/product-images/8uWUl2qZurrMAkhu5x1XshXRRZsyafLpO175xQf4.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:21:31','Anti-Slip Baby Sneakers','অ্যান্টি-স্লিপ বেবি স্নিকার্স','Soft-sole baby shoes with anti-slip grip — light on tiny feet and easy to put on.','নরম সোল ও অ্যান্টি-স্লিপ গ্রিপের বেবি শু — ছোট্ট পায়ে হালকা এবং সহজে পরানো যায়।','Anti-Slip Baby Sneakers. Soft-sole baby shoes with anti-slip grip — light on tiny feet and easy to put on.','অ্যান্টি-স্লিপ বেবি স্নিকার্স। নরম সোল ও অ্যান্টি-স্লিপ গ্রিপের বেবি শু — ছোট্ট পায়ে হালকা এবং সহজে পরানো যায়।',NULL,NULL,NULL,NULL),('143b9d76-1a06-4545-b202-01cf5074af62','নারীদের স্লিপ-অন স্নিকার্স','womens-slip-on-sneakers','নারীদের স্লিপ-অন স্নিকার্স। নরম ফুটবেড ও ব্যালান্সড হিলের স্টাইলিশ নারীদের জুতা, দীর্ঘক্ষণ পরে থাকতে আরামদায়ক।','নরম ফুটবেড ও ব্যালান্সড হিলের স্টাইলিশ নারীদের জুতা, দীর্ঘক্ষণ পরে থাকতে আরামদায়ক।',1650.00,1450.00,NULL,NULL,32,'dedfbf7e-14e0-402b-88b3-42f936884b49',NULL,'/backend/storage/uploads/product-images/TlGBh39IRtzrKPxNaYlSe4T9RXmFfCw2YuHeRPBC.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:22:14','Women\'s Slip-On Sneakers','নারীদের স্লিপ-অন স্নিকার্স','Stylish women\'s footwear with a soft footbed and balanced heel for comfortable long wear.','নরম ফুটবেড ও ব্যালান্সড হিলের স্টাইলিশ নারীদের জুতা, দীর্ঘক্ষণ পরে থাকতে আরামদায়ক।','Women\'s Slip-On Sneakers. Stylish women\'s footwear with a soft footbed and balanced heel for comfortable long wear.','নারীদের স্লিপ-অন স্নিকার্স। নরম ফুটবেড ও ব্যালান্সড হিলের স্টাইলিশ নারীদের জুতা, দীর্ঘক্ষণ পরে থাকতে আরামদায়ক।',NULL,NULL,NULL,NULL),('1eb8f847-a8ed-4ae1-a698-156a845c32c0','ক্লাসিক গ্রে মেলাঞ্জ টি-শার্ট','classic-gray-melange-t-shirt-1784643893-0','নৈমিত্তিক পরিধানের জন্য আরামদায়ক গ্রে মেলাঞ্জ টি-শার্ট। প্রিমিয়াম কটন মিশ্রিত কাপড় থেকে তৈরি।',NULL,650.00,450.00,NULL,NULL,35,'230d95a7-68a6-4aba-a991-6115107cc1fe',NULL,'/backend/storage/uploads/product-images/JAmfuWVDoCBPknduUu3djdZxDwtlt4BM6WL0Gxs9.webp','[]',1,1,NULL,NULL,'2026-07-21 08:24:53','2026-07-28 06:07:40','Classic Gray Melange T-Shirt','ক্লাসিক গ্রে মেলাঞ্জ টি-শার্ট',NULL,NULL,'Comfortable gray melange t-shirt perfect for casual wear. Made from premium cotton blend fabric.','নৈমিত্তিক পরিধানের জন্য আরামদায়ক গ্রে মেলাঞ্জ টি-শার্ট। প্রিমিয়াম কটন মিশ্রিত কাপড় থেকে তৈরি।',NULL,NULL,NULL,NULL),('1ffc243e-8a21-4caf-84da-ef521d0a211c','ভেলক্রো স্ট্র্যাপ টডলার শু','velcro-strap-toddler-shoes','ভেলক্রো স্ট্র্যাপ টডলার শু। নরম সোল ও অ্যান্টি-স্লিপ গ্রিপের বেবি শু — ছোট্ট পায়ে হালকা এবং সহজে পরানো যায়।','নরম সোল ও অ্যান্টি-স্লিপ গ্রিপের বেবি শু — ছোট্ট পায়ে হালকা এবং সহজে পরানো যায়।',890.00,790.00,NULL,NULL,40,'960fedc6-4b96-42f2-94a4-796e03f5fa0f',NULL,'/backend/storage/uploads/product-images/UwDZh2oYRyfQGqIMhN3x6SVlCQVjJfDIdzsCNti7.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:22:57','Velcro Strap Toddler Shoes','ভেলক্রো স্ট্র্যাপ টডলার শু','Soft-sole baby shoes with anti-slip grip — light on tiny feet and easy to put on.','নরম সোল ও অ্যান্টি-স্লিপ গ্রিপের বেবি শু — ছোট্ট পায়ে হালকা এবং সহজে পরানো যায়।','Velcro Strap Toddler Shoes. Soft-sole baby shoes with anti-slip grip — light on tiny feet and easy to put on.','ভেলক্রো স্ট্র্যাপ টডলার শু। নরম সোল ও অ্যান্টি-স্লিপ গ্রিপের বেবি শু — ছোট্ট পায়ে হালকা এবং সহজে পরানো যায়।',NULL,NULL,NULL,NULL),('269bad79-3197-4e68-9fd2-8d0abafaf534','ইনস্টাগ্রাম আইডি প্রিন্ট টি-শার্ট - মিন্ট গ্রিন','instagram-id-print-t-shirt-mint-green-1784643893-1','ইনস্টাগ্রাম আইডি প্রিন্ট এবং QR কোড সহ ট্রেন্ডি মিন্ট গ্রিন টি-শার্ট। সোশ্যাল মিডিয়া প্রেমীদের জন্য নিখুঁত।',NULL,750.00,550.00,NULL,NULL,18,'230d95a7-68a6-4aba-a991-6115107cc1fe',NULL,'/backend/storage/uploads/product-images/OsQZpEDOkiUy1fjwVH3JKjET2WUTkdWWa3iLtplU.webp','[]',1,1,NULL,NULL,'2026-07-21 08:24:53','2026-07-26 01:09:42','Instagram ID Print T-Shirt - Mint Green','ইনস্টাগ্রাম আইডি প্রিন্ট টি-শার্ট - মিন্ট গ্রিন',NULL,NULL,'Trendy mint green t-shirt with Instagram ID print and QR code. Perfect for social media enthusiasts.','ইনস্টাগ্রাম আইডি প্রিন্ট এবং QR কোড সহ ট্রেন্ডি মিন্ট গ্রিন টি-শার্ট। সোশ্যাল মিডিয়া প্রেমীদের জন্য নিখুঁত।',NULL,NULL,NULL,NULL),('291cc11e-fd00-4869-ac30-75e45ae96015','স্লিভ সহ গ্লাস ফিডিং বোতল ২৪০ মিলি','glass-feeding-bottle-with-sleeve-240ml','স্লিভ সহ গ্লাস ফিডিং বোতল ২৪০ মিলি। বিপিএ ফ্রি ফিডিং বোতল, অ্যান্টি-কলিক নিপল সহ — নিরাপদ, সহজে পরিষ্কার ও জীবাণুমুক্ত করা যায়।','বিপিএ ফ্রি ফিডিং বোতল, অ্যান্টি-কলিক নিপল সহ — নিরাপদ, সহজে পরিষ্কার ও জীবাণুমুক্ত করা যায়।',850.00,750.00,NULL,NULL,35,'f47cf9de-6d6c-4046-8c99-e433f62c24d4',NULL,'/backend/storage/uploads/product-images/SETiW49nMXfL84gdrBENMGONbqcLlha6L94eyiBm.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:23:47','Glass Feeding Bottle with Sleeve 240ml','স্লিভ সহ গ্লাস ফিডিং বোতল ২৪০ মিলি','BPA-free feeding bottle with an anti-colic nipple — safe, easy to clean and sterilise.','বিপিএ ফ্রি ফিডিং বোতল, অ্যান্টি-কলিক নিপল সহ — নিরাপদ, সহজে পরিষ্কার ও জীবাণুমুক্ত করা যায়।','Glass Feeding Bottle with Sleeve 240ml. BPA-free feeding bottle with an anti-colic nipple — safe, easy to clean and sterilise.','স্লিভ সহ গ্লাস ফিডিং বোতল ২৪০ মিলি। বিপিএ ফ্রি ফিডিং বোতল, অ্যান্টি-কলিক নিপল সহ — নিরাপদ, সহজে পরিষ্কার ও জীবাণুমুক্ত করা যায়।',NULL,NULL,NULL,NULL),('2aac580a-9d2d-4c9f-b06f-7b4882649f35','কারচুপি সিল্ক থ্রি পিস','karchupi-silk-three-piece','কারচুপি সিল্ক থ্রি পিস। সম্পূর্ণ থ্রি পিস সেট — কামিজ, সালোয়ার ও ওড়না — প্রিমিয়াম কাপড় ও নিখুঁত ফিনিশিংয়ে।','সম্পূর্ণ থ্রি পিস সেট — কামিজ, সালোয়ার ও ওড়না — প্রিমিয়াম কাপড় ও নিখুঁত ফিনিশিংয়ে।',3450.00,3100.00,NULL,NULL,18,'d579d270-8012-454f-b502-f2ba696c7712',NULL,'/backend/storage/uploads/product-images/f1vghazYzcG9c4c3WcU9LJ91SZHjNrJU1xJrm5vJ.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:25:40','Karchupi Silk Three Piece','কারচুপি সিল্ক থ্রি পিস','Complete three piece set — kameez, salwar and orna — in premium fabric with fine finishing.','সম্পূর্ণ থ্রি পিস সেট — কামিজ, সালোয়ার ও ওড়না — প্রিমিয়াম কাপড় ও নিখুঁত ফিনিশিংয়ে।','Karchupi Silk Three Piece. Complete three piece set — kameez, salwar and orna — in premium fabric with fine finishing.','কারচুপি সিল্ক থ্রি পিস। সম্পূর্ণ থ্রি পিস সেট — কামিজ, সালোয়ার ও ওড়না — প্রিমিয়াম কাপড় ও নিখুঁত ফিনিশিংয়ে।',NULL,NULL,NULL,NULL),('2b33686d-3582-4c21-acc7-00eb4a4e5c67','ডিজিটাল স্পোর্টস ঘড়ি','digital-sports-watch','ডিজিটাল স্পোর্টস ঘড়ি। টেকসই মুভমেন্ট ও আরামদায়ক স্ট্র্যাপের ওয়াটার-রেজিস্ট্যান্ট ঘড়ি — দৈনন্দিন ব্যবহার ও উপহারের জন্য আদর্শ।','টেকসই মুভমেন্ট ও আরামদায়ক স্ট্র্যাপের ওয়াটার-রেজিস্ট্যান্ট ঘড়ি — দৈনন্দিন ব্যবহার ও উপহারের জন্য আদর্শ।',1250.00,1090.00,NULL,NULL,45,'0de82e19-70fa-41b8-863f-7797f0a59bfe',NULL,'/backend/storage/uploads/product-images/Got61jnwfNfoTPOPdr7nMHyxcEYADyeZLQqk0Hcq.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:25:00','Digital Sports Watch','ডিজিটাল স্পোর্টস ঘড়ি','Water-resistant watch with a durable movement and a comfortable strap — ideal for daily use or gifting.','টেকসই মুভমেন্ট ও আরামদায়ক স্ট্র্যাপের ওয়াটার-রেজিস্ট্যান্ট ঘড়ি — দৈনন্দিন ব্যবহার ও উপহারের জন্য আদর্শ।','Digital Sports Watch. Water-resistant watch with a durable movement and a comfortable strap — ideal for daily use or gifting.','ডিজিটাল স্পোর্টস ঘড়ি। টেকসই মুভমেন্ট ও আরামদায়ক স্ট্র্যাপের ওয়াটার-রেজিস্ট্যান্ট ঘড়ি — দৈনন্দিন ব্যবহার ও উপহারের জন্য আদর্শ।',NULL,NULL,NULL,NULL),('2d1f9bd1-9dd0-4954-9033-a8fd5735fc27','কার্টুন প্রিন্ট বেবি স্যান্ডেল','cartoon-print-baby-sandals','কার্টুন প্রিন্ট বেবি স্যান্ডেল। নরম সোল ও অ্যান্টি-স্লিপ গ্রিপের বেবি শু — ছোট্ট পায়ে হালকা এবং সহজে পরানো যায়।','নরম সোল ও অ্যান্টি-স্লিপ গ্রিপের বেবি শু — ছোট্ট পায়ে হালকা এবং সহজে পরানো যায়।',690.00,590.00,NULL,NULL,48,'960fedc6-4b96-42f2-94a4-796e03f5fa0f',NULL,'/backend/storage/uploads/product-images/CUlpzIaU1GQu3ytK9hTsDNRfVFkKS8lBuSF6WmBL.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:27:01','Cartoon Print Baby Sandals','কার্টুন প্রিন্ট বেবি স্যান্ডেল','Soft-sole baby shoes with anti-slip grip — light on tiny feet and easy to put on.','নরম সোল ও অ্যান্টি-স্লিপ গ্রিপের বেবি শু — ছোট্ট পায়ে হালকা এবং সহজে পরানো যায়।','Cartoon Print Baby Sandals. Soft-sole baby shoes with anti-slip grip — light on tiny feet and easy to put on.','কার্টুন প্রিন্ট বেবি স্যান্ডেল। নরম সোল ও অ্যান্টি-স্লিপ গ্রিপের বেবি শু — ছোট্ট পায়ে হালকা এবং সহজে পরানো যায়।',NULL,NULL,NULL,NULL),('2d7c3b44-58d0-4b2d-9466-aeebe5bf76b0','ব্ল্যাক বাটারফ্লাই বোরকা','black-butterfly-burqa','ব্ল্যাক বাটারফ্লাই বোরকা। হালকা ও আরামদায়ক ফিটের মার্জিত বোরকা, প্রতিদিনের ব্যবহারের জন্য মানসম্মত ফিনিশিং।','হালকা ও আরামদায়ক ফিটের মার্জিত বোরকা, প্রতিদিনের ব্যবহারের জন্য মানসম্মত ফিনিশিং।',2450.00,2150.00,NULL,NULL,30,'1f6beccd-c992-4805-8e63-582f2d5b5bfc',NULL,'/backend/storage/uploads/product-images/NyzmxsubP0u6pKeG9OKb1VTSsRRDSJsWUcs9sIoc.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:28:01','Black Butterfly Burqa','ব্ল্যাক বাটারফ্লাই বোরকা','Modest, lightweight burqa with a comfortable fit and quality finishing for everyday use.','হালকা ও আরামদায়ক ফিটের মার্জিত বোরকা, প্রতিদিনের ব্যবহারের জন্য মানসম্মত ফিনিশিং।','Black Butterfly Burqa. Modest, lightweight burqa with a comfortable fit and quality finishing for everyday use.','ব্ল্যাক বাটারফ্লাই বোরকা। হালকা ও আরামদায়ক ফিটের মার্জিত বোরকা, প্রতিদিনের ব্যবহারের জন্য মানসম্মত ফিনিশিং।',NULL,NULL,NULL,NULL),('2ecb838e-98f3-4083-98de-69f1d2d6d361','নারীদের ব্লক হিল স্যান্ডেল','womens-block-heel-sandals','নারীদের ব্লক হিল স্যান্ডেল। নরম ফুটবেড ও ব্যালান্সড হিলের স্টাইলিশ নারীদের জুতা, দীর্ঘক্ষণ পরে থাকতে আরামদায়ক।','নরম ফুটবেড ও ব্যালান্সড হিলের স্টাইলিশ নারীদের জুতা, দীর্ঘক্ষণ পরে থাকতে আরামদায়ক।',1450.00,1290.00,NULL,NULL,35,'dedfbf7e-14e0-402b-88b3-42f936884b49',NULL,'/backend/storage/uploads/product-images/7xQEptmHV2dayxY4FCJkw353f8aUKtGne3BzPphr.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:28:51','Women\'s Block Heel Sandals','নারীদের ব্লক হিল স্যান্ডেল','Stylish women\'s footwear with a soft footbed and balanced heel for comfortable long wear.','নরম ফুটবেড ও ব্যালান্সড হিলের স্টাইলিশ নারীদের জুতা, দীর্ঘক্ষণ পরে থাকতে আরামদায়ক।','Women\'s Block Heel Sandals. Stylish women\'s footwear with a soft footbed and balanced heel for comfortable long wear.','নারীদের ব্লক হিল স্যান্ডেল। নরম ফুটবেড ও ব্যালান্সড হিলের স্টাইলিশ নারীদের জুতা, দীর্ঘক্ষণ পরে থাকতে আরামদায়ক।',NULL,NULL,NULL,NULL),('2f03c7a6-81b4-4a7b-b413-f0775466794e','খাঁটি সুন্দরবনের মধু ৫০০ গ্রাম','pure-sundarban-honey-500g','খাঁটি সুন্দরবনের মধু ৫০০ গ্রাম। বিশ্বস্ত স্থানীয় উৎপাদকদের কাছ থেকে সরাসরি সংগ্রহ করা খাঁটি ও কেমিক্যালমুক্ত অর্গানিক খাদ্যপণ্য।','বিশ্বস্ত স্থানীয় উৎপাদকদের কাছ থেকে সরাসরি সংগ্রহ করা খাঁটি ও কেমিক্যালমুক্ত অর্গানিক খাদ্যপণ্য।',850.00,750.00,NULL,NULL,50,'1148ec67-4236-4352-a129-dc138d6bbf68',NULL,'/backend/storage/uploads/product-images/0ThEKufaqaGiTUYJdShfoguEdd08mTjBZDCnNjUv.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:29:44','Pure Sundarban Honey 500g','খাঁটি সুন্দরবনের মধু ৫০০ গ্রাম','Pure, chemical-free organic food item sourced directly from trusted local producers.','বিশ্বস্ত স্থানীয় উৎপাদকদের কাছ থেকে সরাসরি সংগ্রহ করা খাঁটি ও কেমিক্যালমুক্ত অর্গানিক খাদ্যপণ্য।','Pure Sundarban Honey 500g. Pure, chemical-free organic food item sourced directly from trusted local producers.','খাঁটি সুন্দরবনের মধু ৫০০ গ্রাম। বিশ্বস্ত স্থানীয় উৎপাদকদের কাছ থেকে সরাসরি সংগ্রহ করা খাঁটি ও কেমিক্যালমুক্ত অর্গানিক খাদ্যপণ্য।',NULL,NULL,NULL,NULL),('2f6d6251-c0f3-4c1b-b134-c68c7914d043','টু পিস নাইটওয়্যার সেট','two-piece-nightwear-set','টু পিস নাইটওয়্যার সেট। নরম ও ত্বকবান্ধব নাইটওয়্যার, আরামদায়ক ঘুমের জন্য বিশেষভাবে তৈরি।','নরম ও ত্বকবান্ধব নাইটওয়্যার, আরামদায়ক ঘুমের জন্য বিশেষভাবে তৈরি।',1450.00,1290.00,NULL,NULL,35,'42c9cccc-7606-46b0-a398-31d5700bde4b',NULL,'/backend/storage/uploads/product-images/dWk40eG8ktZoRpeG0IITthq09KTHJ57a5UQhi4ON.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:31:21','Two Piece Nightwear Set','টু পিস নাইটওয়্যার সেট','Soft, skin-friendly nightwear designed for a relaxed and comfortable sleep.','নরম ও ত্বকবান্ধব নাইটওয়্যার, আরামদায়ক ঘুমের জন্য বিশেষভাবে তৈরি।','Two Piece Nightwear Set. Soft, skin-friendly nightwear designed for a relaxed and comfortable sleep.','টু পিস নাইটওয়্যার সেট। নরম ও ত্বকবান্ধব নাইটওয়্যার, আরামদায়ক ঘুমের জন্য বিশেষভাবে তৈরি।',NULL,NULL,NULL,NULL),('31078ed0-e944-4aff-9ec0-2fb69066b3c9','চিনিগুড়া সুগন্ধি চাল ৫ কেজি','chinigura-aromatic-rice-5kg','চিনিগুড়া সুগন্ধি চাল ৫ কেজি। বিশ্বস্ত স্থানীয় উৎপাদকদের কাছ থেকে সরাসরি সংগ্রহ করা খাঁটি ও কেমিক্যালমুক্ত অর্গানিক খাদ্যপণ্য।','বিশ্বস্ত স্থানীয় উৎপাদকদের কাছ থেকে সরাসরি সংগ্রহ করা খাঁটি ও কেমিক্যালমুক্ত অর্গানিক খাদ্যপণ্য।',750.00,690.00,NULL,NULL,45,'1148ec67-4236-4352-a129-dc138d6bbf68',NULL,'/backend/storage/uploads/product-images/smVy6YoxcaIgcvti0rU2OOZRc1lyoKNoc0AA6vvR.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:32:35','Chinigura Aromatic Rice 5kg','চিনিগুড়া সুগন্ধি চাল ৫ কেজি','Pure, chemical-free organic food item sourced directly from trusted local producers.','বিশ্বস্ত স্থানীয় উৎপাদকদের কাছ থেকে সরাসরি সংগ্রহ করা খাঁটি ও কেমিক্যালমুক্ত অর্গানিক খাদ্যপণ্য।','Chinigura Aromatic Rice 5kg. Pure, chemical-free organic food item sourced directly from trusted local producers.','চিনিগুড়া সুগন্ধি চাল ৫ কেজি। বিশ্বস্ত স্থানীয় উৎপাদকদের কাছ থেকে সরাসরি সংগ্রহ করা খাঁটি ও কেমিক্যালমুক্ত অর্গানিক খাদ্যপণ্য।',NULL,NULL,NULL,NULL),('35fea32d-6759-43eb-9ab8-9ab9b77d89e9','নবজাতক ফিডিং বোতল স্টার্টার প্যাক','newborn-feeding-bottle-starter-pack','নবজাতক ফিডিং বোতল স্টার্টার প্যাক। বিপিএ ফ্রি ফিডিং বোতল, অ্যান্টি-কলিক নিপল সহ — নিরাপদ, সহজে পরিষ্কার ও জীবাণুমুক্ত করা যায়।','বিপিএ ফ্রি ফিডিং বোতল, অ্যান্টি-কলিক নিপল সহ — নিরাপদ, সহজে পরিষ্কার ও জীবাণুমুক্ত করা যায়।',1250.00,1090.00,NULL,NULL,28,'f47cf9de-6d6c-4046-8c99-e433f62c24d4',NULL,'/backend/storage/uploads/product-images/7Vs5WDNE8pm698F3nNqg1gjHzfKxfjnBhrgEqgND.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:34:41','Newborn Feeding Bottle Starter Pack','নবজাতক ফিডিং বোতল স্টার্টার প্যাক','BPA-free feeding bottle with an anti-colic nipple — safe, easy to clean and sterilise.','বিপিএ ফ্রি ফিডিং বোতল, অ্যান্টি-কলিক নিপল সহ — নিরাপদ, সহজে পরিষ্কার ও জীবাণুমুক্ত করা যায়।','Newborn Feeding Bottle Starter Pack. BPA-free feeding bottle with an anti-colic nipple — safe, easy to clean and sterilise.','নবজাতক ফিডিং বোতল স্টার্টার প্যাক। বিপিএ ফ্রি ফিডিং বোতল, অ্যান্টি-কলিক নিপল সহ — নিরাপদ, সহজে পরিষ্কার ও জীবাণুমুক্ত করা যায়।',NULL,NULL,NULL,NULL),('39b6aa8f-4c48-4162-a0a6-4bc228320b9b','নবজাতক ৫ পিস কটন গিফট সেট','newborn-5-piece-cotton-gift-set','নবজাতক ৫ পিস কটন গিফট সেট। নরম কটনে তৈরি ত্বকের জন্য নিরাপদ নবজাতক সেট — উপহার হিসেবেও চমৎকার।','নরম কটনে তৈরি ত্বকের জন্য নিরাপদ নবজাতক সেট — উপহার হিসেবেও চমৎকার।',1250.00,1090.00,NULL,NULL,40,'9832d1fc-8f3f-44c5-9ef1-1e0116c436ad',NULL,'/backend/storage/uploads/product-images/tf4IYQbxYVWpy28PrgPysf7DrG6UHtYfENQKMEu3.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:35:31','Newborn 5 Piece Cotton Gift Set','নবজাতক ৫ পিস কটন গিফট সেট','Gentle, skin-safe newborn set made from soft cotton — ideal as a baby shower gift.','নরম কটনে তৈরি ত্বকের জন্য নিরাপদ নবজাতক সেট — উপহার হিসেবেও চমৎকার।','Newborn 5 Piece Cotton Gift Set. Gentle, skin-safe newborn set made from soft cotton — ideal as a baby shower gift.','নবজাতক ৫ পিস কটন গিফট সেট। নরম কটনে তৈরি ত্বকের জন্য নিরাপদ নবজাতক সেট — উপহার হিসেবেও চমৎকার।',NULL,NULL,NULL,NULL),('39d10874-cc6c-4e6c-bb9c-fecafdcaff5f','নারীদের রোজ গোল্ড ব্রেসলেট ঘড়ি','womens-rose-gold-bracelet-watch','নারীদের রোজ গোল্ড ব্রেসলেট ঘড়ি। টেকসই মুভমেন্ট ও আরামদায়ক স্ট্র্যাপের ওয়াটার-রেজিস্ট্যান্ট ঘড়ি — দৈনন্দিন ব্যবহার ও উপহারের জন্য আদর্শ।','টেকসই মুভমেন্ট ও আরামদায়ক স্ট্র্যাপের ওয়াটার-রেজিস্ট্যান্ট ঘড়ি — দৈনন্দিন ব্যবহার ও উপহারের জন্য আদর্শ।',2850.00,2450.00,NULL,NULL,25,'0de82e19-70fa-41b8-863f-7797f0a59bfe',NULL,'/backend/storage/uploads/product-images/EO8ZcOJxiRSz7AppRO09rDYEGvrAVll0SbYBjWta.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:36:18','Women\'s Rose Gold Bracelet Watch','নারীদের রোজ গোল্ড ব্রেসলেট ঘড়ি','Water-resistant watch with a durable movement and a comfortable strap — ideal for daily use or gifting.','টেকসই মুভমেন্ট ও আরামদায়ক স্ট্র্যাপের ওয়াটার-রেজিস্ট্যান্ট ঘড়ি — দৈনন্দিন ব্যবহার ও উপহারের জন্য আদর্শ।','Women\'s Rose Gold Bracelet Watch. Water-resistant watch with a durable movement and a comfortable strap — ideal for daily use or gifting.','নারীদের রোজ গোল্ড ব্রেসলেট ঘড়ি। টেকসই মুভমেন্ট ও আরামদায়ক স্ট্র্যাপের ওয়াটার-রেজিস্ট্যান্ট ঘড়ি — দৈনন্দিন ব্যবহার ও উপহারের জন্য আদর্শ।',NULL,NULL,NULL,NULL),('3b86767b-9cd9-4935-b527-1862c6063891','সফট ম্যাক্সি নাইট গাউন','soft-maxi-night-gown','সফট ম্যাক্সি নাইট গাউন। নরম ও ত্বকবান্ধব নাইটওয়্যার, আরামদায়ক ঘুমের জন্য বিশেষভাবে তৈরি।','নরম ও ত্বকবান্ধব নাইটওয়্যার, আরামদায়ক ঘুমের জন্য বিশেষভাবে তৈরি।',1250.00,1090.00,NULL,NULL,40,'42c9cccc-7606-46b0-a398-31d5700bde4b',NULL,'/backend/storage/uploads/product-images/LRuPYK3J2goVHm7AY4gVN7mykNxGJVMI56dNNxli.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:37:32','Soft Maxi Night Gown','সফট ম্যাক্সি নাইট গাউন','Soft, skin-friendly nightwear designed for a relaxed and comfortable sleep.','নরম ও ত্বকবান্ধব নাইটওয়্যার, আরামদায়ক ঘুমের জন্য বিশেষভাবে তৈরি।','Soft Maxi Night Gown. Soft, skin-friendly nightwear designed for a relaxed and comfortable sleep.','সফট ম্যাক্সি নাইট গাউন। নরম ও ত্বকবান্ধব নাইটওয়্যার, আরামদায়ক ঘুমের জন্য বিশেষভাবে তৈরি।',NULL,NULL,NULL,NULL),('3b99a154-8392-4259-a3fe-8f29081c34ab','ব্ল্যাক লেদার বাইকার জ্যাকেট','black-leather-biker-jacket','ব্ল্যাক লেদার বাইকার জ্যাকেট। উষ্ণ ও সুন্দর ফিনিশিংয়ের পুরুষদের জ্যাকেট, শীতের মৌসুম ও ক্যাজুয়াল ব্যবহারের জন্য উপযুক্ত।','উষ্ণ ও সুন্দর ফিনিশিংয়ের পুরুষদের জ্যাকেট, শীতের মৌসুম ও ক্যাজুয়াল ব্যবহারের জন্য উপযুক্ত।',3900.00,3450.00,NULL,NULL,20,'e765a2bc-5a60-40a1-89f9-5ca8aa37f5a4',NULL,'/backend/storage/uploads/product-images/nGNNOIItlPiiAC9GK1mHselSEXGvONNkuYf4cT7Y.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:38:49','Black Leather Biker Jacket','ব্ল্যাক লেদার বাইকার জ্যাকেট','Warm, well-finished men\'s jacket built for the winter season and casual outings alike.','উষ্ণ ও সুন্দর ফিনিশিংয়ের পুরুষদের জ্যাকেট, শীতের মৌসুম ও ক্যাজুয়াল ব্যবহারের জন্য উপযুক্ত।','Black Leather Biker Jacket. Warm, well-finished men\'s jacket built for the winter season and casual outings alike.','ব্ল্যাক লেদার বাইকার জ্যাকেট। উষ্ণ ও সুন্দর ফিনিশিংয়ের পুরুষদের জ্যাকেট, শীতের মৌসুম ও ক্যাজুয়াল ব্যবহারের জন্য উপযুক্ত।',NULL,NULL,NULL,NULL),('3c40a32e-dbce-4741-825b-3401c71512da','বেবি গার্ল ফ্রক কটন ড্রেস','baby-girl-frock-cotton-dress','বেবি গার্ল ফ্রক কটন ড্রেস। নরম কটনে তৈরি আরামদায়ক ও সুন্দর বেবি ড্রেস, শিশুর কোমল ত্বকের জন্য নিরাপদ।','নরম কটনে তৈরি আরামদায়ক ও সুন্দর বেবি ড্রেস, শিশুর কোমল ত্বকের জন্য নিরাপদ।',850.00,750.00,NULL,NULL,45,'379faa6f-9379-44cf-9db1-c83793ac069e',NULL,'/backend/storage/uploads/product-images/DGEkIA5RYWAotob5VFwUyZXWnGyn6jlawLVGRpEn.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:39:31','Baby Girl Frock Cotton Dress','বেবি গার্ল ফ্রক কটন ড্রেস','Cute, breathable baby dress made from soft cotton that is gentle on delicate skin.','নরম কটনে তৈরি আরামদায়ক ও সুন্দর বেবি ড্রেস, শিশুর কোমল ত্বকের জন্য নিরাপদ।','Baby Girl Frock Cotton Dress. Cute, breathable baby dress made from soft cotton that is gentle on delicate skin.','বেবি গার্ল ফ্রক কটন ড্রেস। নরম কটনে তৈরি আরামদায়ক ও সুন্দর বেবি ড্রেস, শিশুর কোমল ত্বকের জন্য নিরাপদ।',NULL,NULL,NULL,NULL),('3c7d1b43-9d7a-4ddc-ace0-423dd81e46b1','অর্গানিক ঘি ৫০০ মিলি','organic-ghee-500ml','অর্গানিক ঘি ৫০০ মিলি। বিশ্বস্ত স্থানীয় উৎপাদকদের কাছ থেকে সরাসরি সংগ্রহ করা খাঁটি ও কেমিক্যালমুক্ত অর্গানিক খাদ্যপণ্য।','বিশ্বস্ত স্থানীয় উৎপাদকদের কাছ থেকে সরাসরি সংগ্রহ করা খাঁটি ও কেমিক্যালমুক্ত অর্গানিক খাদ্যপণ্য।',1250.00,1090.00,NULL,NULL,40,'1148ec67-4236-4352-a129-dc138d6bbf68',NULL,'/backend/storage/uploads/product-images/xZzlHsPr33s4noB6DlOeTDaIwdbRkMRy8bqWwuGX.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:41:15','Organic Ghee 500ml','অর্গানিক ঘি ৫০০ মিলি','Pure, chemical-free organic food item sourced directly from trusted local producers.','বিশ্বস্ত স্থানীয় উৎপাদকদের কাছ থেকে সরাসরি সংগ্রহ করা খাঁটি ও কেমিক্যালমুক্ত অর্গানিক খাদ্যপণ্য।','Organic Ghee 500ml. Pure, chemical-free organic food item sourced directly from trusted local producers.','অর্গানিক ঘি ৫০০ মিলি। বিশ্বস্ত স্থানীয় উৎপাদকদের কাছ থেকে সরাসরি সংগ্রহ করা খাঁটি ও কেমিক্যালমুক্ত অর্গানিক খাদ্যপণ্য।',NULL,NULL,NULL,NULL),('3e9b586e-2127-4c7b-82a7-3802997cece9','উডেন স্ট্যাকিং রিং খেলনা','wooden-stacking-ring-toy','উডেন স্ট্যাকিং রিং খেলনা। বিষমুক্ত ও বয়স-উপযোগী খেলনা, যা শিশুর মোটর স্কিল বিকাশে সাহায্য করে এবং ব্যস্ত রাখে।','বিষমুক্ত ও বয়স-উপযোগী খেলনা, যা শিশুর মোটর স্কিল বিকাশে সাহায্য করে এবং ব্যস্ত রাখে।',750.00,650.00,NULL,NULL,35,'c9545279-4481-43ce-9847-d9b6cb82411c',NULL,'/backend/storage/uploads/product-images/PoFTwai9rApc8GcRJVrm7Lnp1dMslYbYprdAlQDV.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:42:03','Wooden Stacking Ring Toy','উডেন স্ট্যাকিং রিং খেলনা','Non-toxic, age-appropriate toy that helps develop motor skills while keeping little ones busy.','বিষমুক্ত ও বয়স-উপযোগী খেলনা, যা শিশুর মোটর স্কিল বিকাশে সাহায্য করে এবং ব্যস্ত রাখে।','Wooden Stacking Ring Toy. Non-toxic, age-appropriate toy that helps develop motor skills while keeping little ones busy.','উডেন স্ট্যাকিং রিং খেলনা। বিষমুক্ত ও বয়স-উপযোগী খেলনা, যা শিশুর মোটর স্কিল বিকাশে সাহায্য করে এবং ব্যস্ত রাখে।',NULL,NULL,NULL,NULL),('3f0d55d1-4e0a-4799-8790-47d3d1cfb09e','নেভি ব্লু রাউন্ড নেক টি-শার্ট','navy-blue-round-neck-t-shirt-1784643893-3','রাউন্ড নেক সহ ক্লাসিক নেভি ব্লু টি-শার্ট। প্রতিদিনের পরিধানের জন্য নিখুঁত।',NULL,650.00,450.00,NULL,NULL,43,'230d95a7-68a6-4aba-a991-6115107cc1fe',NULL,'/backend/storage/uploads/product-images/FciWeb3k5yk2TRZqdD8DeL7FFLzObS7dUAkFj1eH.webp','[]',1,0,NULL,NULL,'2026-07-21 08:24:53','2026-07-26 01:10:00','Navy Blue Round Neck T-Shirt','নেভি ব্লু রাউন্ড নেক টি-শার্ট',NULL,NULL,'Classic navy blue t-shirt with round neck. Perfect for everyday wear.','রাউন্ড নেক সহ ক্লাসিক নেভি ব্লু টি-শার্ট। প্রতিদিনের পরিধানের জন্য নিখুঁত।',NULL,NULL,NULL,NULL),('40df4828-6baa-4dcb-b203-0a713f94e269','নারীদের কুশনড রানিং সু','womens-cushioned-running-shoes','নারীদের কুশনড রানিং সু। হালকা ওজনের রানিং সু, রেসপন্সিভ কুশনিং সহ — প্রতিদিনের দৌড় ও লং ডিসট্যান্সের জন্য।','হালকা ওজনের রানিং সু, রেসপন্সিভ কুশনিং সহ — প্রতিদিনের দৌড় ও লং ডিসট্যান্সের জন্য।',2450.00,2190.00,NULL,NULL,28,'98ff4184-0bc2-46eb-bdb9-090a5a9ea48b',NULL,'/backend/storage/uploads/product-images/4A8YnofnfVzjI2neRAibriwp2r6w0HU2oMdAH7em.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:43:20','Women\'s Cushioned Running Shoes','নারীদের কুশনড রানিং সু','Lightweight running shoes with responsive cushioning for daily runs and long distance.','হালকা ওজনের রানিং সু, রেসপন্সিভ কুশনিং সহ — প্রতিদিনের দৌড় ও লং ডিসট্যান্সের জন্য।','Women\'s Cushioned Running Shoes. Lightweight running shoes with responsive cushioning for daily runs and long distance.','নারীদের কুশনড রানিং সু। হালকা ওজনের রানিং সু, রেসপন্সিভ কুশনিং সহ — প্রতিদিনের দৌড় ও লং ডিসট্যান্সের জন্য।',NULL,NULL,NULL,NULL),('40e0c28e-8c07-413c-85bb-b3a6018648bc','আর্জেন্টিনা ফুটবল ফ্যান জার্সি','argentina-football-fan-jersey','আর্জেন্টিনা ফুটবল ফ্যান জার্সি। ঘাম শোষণকারী ব্রিদেবল ড্রাই-ফিট জার্সি — ম্যাচ ও প্র্যাকটিস দুটোর জন্যই উপযুক্ত।','ঘাম শোষণকারী ব্রিদেবল ড্রাই-ফিট জার্সি — ম্যাচ ও প্র্যাকটিস দুটোর জন্যই উপযুক্ত।',950.00,840.00,NULL,NULL,55,'fc305213-ee82-4d73-9a38-d053da907108',NULL,'/backend/storage/uploads/product-images/bOMziU6RmBKMqDxnp3mt2vTts8bck5c5BoyDIEun.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:44:28','Argentina Football Fan Jersey','আর্জেন্টিনা ফুটবল ফ্যান জার্সি','Breathable dry-fit jersey that wicks sweat away — made for match day and practice.','ঘাম শোষণকারী ব্রিদেবল ড্রাই-ফিট জার্সি — ম্যাচ ও প্র্যাকটিস দুটোর জন্যই উপযুক্ত।','Argentina Football Fan Jersey. Breathable dry-fit jersey that wicks sweat away — made for match day and practice.','আর্জেন্টিনা ফুটবল ফ্যান জার্সি। ঘাম শোষণকারী ব্রিদেবল ড্রাই-ফিট জার্সি — ম্যাচ ও প্র্যাকটিস দুটোর জন্যই উপযুক্ত।',NULL,NULL,NULL,NULL),('410adf29-4bf8-49fc-93dd-2db31c586186','ব্লুটুথ পোর্টেবল স্পিকার','bluetooth-portable-speaker','ব্লুটুথ পোর্টেবল স্পিকার। নির্ভরযোগ্য বিল্ড কোয়ালিটির প্রয়োজনীয় দৈনন্দিন গ্যাজেট, স্ট্যান্ডার্ড ওয়ারেন্টি সহ।','নির্ভরযোগ্য বিল্ড কোয়ালিটির প্রয়োজনীয় দৈনন্দিন গ্যাজেট, স্ট্যান্ডার্ড ওয়ারেন্টি সহ।',1650.00,1450.00,NULL,NULL,35,'e83c5c5d-74d7-45b2-ba74-f4e8dd51c73b',NULL,'/backend/storage/uploads/product-images/NyYG8LmUUVjeOpYH9MzBgm9Q3CP7BdycydDtlU4h.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:45:04','Bluetooth Portable Speaker','ব্লুটুথ পোর্টেবল স্পিকার','Handy everyday gadget with reliable build quality and a standard warranty.','নির্ভরযোগ্য বিল্ড কোয়ালিটির প্রয়োজনীয় দৈনন্দিন গ্যাজেট, স্ট্যান্ডার্ড ওয়ারেন্টি সহ।','Bluetooth Portable Speaker. Handy everyday gadget with reliable build quality and a standard warranty.','ব্লুটুথ পোর্টেবল স্পিকার। নির্ভরযোগ্য বিল্ড কোয়ালিটির প্রয়োজনীয় দৈনন্দিন গ্যাজেট, স্ট্যান্ডার্ড ওয়ারেন্টি সহ।',NULL,NULL,NULL,NULL),('430b4722-d39c-41d3-ba25-6f0578157404','হার্ট রেট মনিটর সহ স্মার্ট ওয়াচ','smart-watch-with-heart-rate-monitor','হার্ট রেট মনিটর সহ স্মার্ট ওয়াচ। টেকসই মুভমেন্ট ও আরামদায়ক স্ট্র্যাপের ওয়াটার-রেজিস্ট্যান্ট ঘড়ি — দৈনন্দিন ব্যবহার ও উপহারের জন্য আদর্শ।','টেকসই মুভমেন্ট ও আরামদায়ক স্ট্র্যাপের ওয়াটার-রেজিস্ট্যান্ট ঘড়ি — দৈনন্দিন ব্যবহার ও উপহারের জন্য আদর্শ।',3450.00,2990.00,NULL,NULL,28,'0de82e19-70fa-41b8-863f-7797f0a59bfe',NULL,'/backend/storage/uploads/product-images/7NoXgzMqNjes0dE6S7mjUOY2PWo9Ys84PwS85TH7.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:46:03','Smart Watch with Heart Rate Monitor','হার্ট রেট মনিটর সহ স্মার্ট ওয়াচ','Water-resistant watch with a durable movement and a comfortable strap — ideal for daily use or gifting.','টেকসই মুভমেন্ট ও আরামদায়ক স্ট্র্যাপের ওয়াটার-রেজিস্ট্যান্ট ঘড়ি — দৈনন্দিন ব্যবহার ও উপহারের জন্য আদর্শ।','Smart Watch with Heart Rate Monitor. Water-resistant watch with a durable movement and a comfortable strap — ideal for daily use or gifting.','হার্ট রেট মনিটর সহ স্মার্ট ওয়াচ। টেকসই মুভমেন্ট ও আরামদায়ক স্ট্র্যাপের ওয়াটার-রেজিস্ট্যান্ট ঘড়ি — দৈনন্দিন ব্যবহার ও উপহারের জন্য আদর্শ।',NULL,NULL,NULL,NULL),('43286efc-b0d1-41ba-a06e-bb4a8e6b8167','ফ্লোরাল স্লিভলেস নাইট ড্রেস','floral-sleeveless-night-dress','ফ্লোরাল স্লিভলেস নাইট ড্রেস। নরম ও ত্বকবান্ধব নাইটওয়্যার, আরামদায়ক ঘুমের জন্য বিশেষভাবে তৈরি।','নরম ও ত্বকবান্ধব নাইটওয়্যার, আরামদায়ক ঘুমের জন্য বিশেষভাবে তৈরি।',1050.00,920.00,NULL,NULL,42,'42c9cccc-7606-46b0-a398-31d5700bde4b',NULL,'/backend/storage/uploads/product-images/KOph9TsXTtvWzvBFhW2frh9PbyVgC2qzhjgPkjNi.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:46:40','Floral Sleeveless Night Dress','ফ্লোরাল স্লিভলেস নাইট ড্রেস','Soft, skin-friendly nightwear designed for a relaxed and comfortable sleep.','নরম ও ত্বকবান্ধব নাইটওয়্যার, আরামদায়ক ঘুমের জন্য বিশেষভাবে তৈরি।','Floral Sleeveless Night Dress. Soft, skin-friendly nightwear designed for a relaxed and comfortable sleep.','ফ্লোরাল স্লিভলেস নাইট ড্রেস। নরম ও ত্বকবান্ধব নাইটওয়্যার, আরামদায়ক ঘুমের জন্য বিশেষভাবে তৈরি।',NULL,NULL,NULL,NULL),('445db0df-17c8-4d85-a203-88159374ecd5','ওয়্যারলেস ব্লুটুথ ইয়ারবাডস','wireless-bluetooth-earbuds','ওয়্যারলেস ব্লুটুথ ইয়ারবাডস। নির্ভরযোগ্য বিল্ড কোয়ালিটির প্রয়োজনীয় দৈনন্দিন গ্যাজেট, স্ট্যান্ডার্ড ওয়ারেন্টি সহ।','নির্ভরযোগ্য বিল্ড কোয়ালিটির প্রয়োজনীয় দৈনন্দিন গ্যাজেট, স্ট্যান্ডার্ড ওয়ারেন্টি সহ।',1850.00,1590.00,NULL,NULL,40,'e83c5c5d-74d7-45b2-ba74-f4e8dd51c73b',NULL,'/backend/storage/uploads/product-images/VjbIYJXQKtbboyqlYVe8pGFI1RjdKVvbIFAH4zRY.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:47:21','Wireless Bluetooth Earbuds','ওয়্যারলেস ব্লুটুথ ইয়ারবাডস','Handy everyday gadget with reliable build quality and a standard warranty.','নির্ভরযোগ্য বিল্ড কোয়ালিটির প্রয়োজনীয় দৈনন্দিন গ্যাজেট, স্ট্যান্ডার্ড ওয়ারেন্টি সহ।','Wireless Bluetooth Earbuds. Handy everyday gadget with reliable build quality and a standard warranty.','ওয়্যারলেস ব্লুটুথ ইয়ারবাডস। নির্ভরযোগ্য বিল্ড কোয়ালিটির প্রয়োজনীয় দৈনন্দিন গ্যাজেট, স্ট্যান্ডার্ড ওয়ারেন্টি সহ।',NULL,NULL,NULL,NULL),('463392cd-28e8-45a6-aaa7-58b21e0f2cd5','বেসিক কালো টি-শার্ট','basic-black-t-shirt-1784643893-2','আপনার পোশাক সংগ্রহের জন্য প্রয়োজনীয় কালো টি-শার্ট। প্রিমিয়াম মানের কাপড় দিয়ে আরামদায়ক ফিট।',NULL,600.00,400.00,NULL,NULL,16,'230d95a7-68a6-4aba-a991-6115107cc1fe',NULL,'/backend/storage/uploads/product-images/jW0BUjDnVamo8h37KYp3DlzCfREKWyf2vyXCw6q2.webp','[]',1,1,NULL,NULL,'2026-07-21 08:24:53','2026-07-26 01:10:21','Basic Black T-Shirt','বেসিক কালো টি-শার্ট',NULL,NULL,'Essential black t-shirt for your wardrobe. Comfortable fit with premium quality fabric.','আপনার পোশাক সংগ্রহের জন্য প্রয়োজনীয় কালো টি-শার্ট। প্রিমিয়াম মানের কাপড় দিয়ে আরামদায়ক ফিট।',NULL,NULL,NULL,NULL),('47598670-3f10-48c8-ad93-c63708c07208','লিনেন কমফোর্ট নাইট ড্রেস','linen-comfort-night-dress','লিনেন কমফোর্ট নাইট ড্রেস। নরম ও ত্বকবান্ধব নাইটওয়্যার, আরামদায়ক ঘুমের জন্য বিশেষভাবে তৈরি।','নরম ও ত্বকবান্ধব নাইটওয়্যার, আরামদায়ক ঘুমের জন্য বিশেষভাবে তৈরি।',1150.00,990.00,NULL,NULL,38,'42c9cccc-7606-46b0-a398-31d5700bde4b',NULL,'/backend/storage/uploads/product-images/7CJT7b0JKPKDoIMkKia4san4i30h4U3m19r6TOqj.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:48:27','Linen Comfort Night Dress','লিনেন কমফোর্ট নাইট ড্রেস','Soft, skin-friendly nightwear designed for a relaxed and comfortable sleep.','নরম ও ত্বকবান্ধব নাইটওয়্যার, আরামদায়ক ঘুমের জন্য বিশেষভাবে তৈরি।','Linen Comfort Night Dress. Soft, skin-friendly nightwear designed for a relaxed and comfortable sleep.','লিনেন কমফোর্ট নাইট ড্রেস। নরম ও ত্বকবান্ধব নাইটওয়্যার, আরামদায়ক ঘুমের জন্য বিশেষভাবে তৈরি।',NULL,NULL,NULL,NULL),('47f3db05-9d9d-4715-9a1c-cca22b817773','খাকি স্লিম ফিট গ্যাবার্ডিন প্যান্ট','khaki-slim-fit-gabardine-pant','খাকি স্লিম ফিট গ্যাবার্ডিন প্যান্ট। আরামদায়ক দৈনন্দিন পুরুষদের প্যান্ট, পরিচ্ছন্ন কাট ও টেকসই সেলাই। সব স্ট্যান্ডার্ড সাইজে পাওয়া যাচ্ছে।','আরামদায়ক দৈনন্দিন পুরুষদের প্যান্ট, পরিচ্ছন্ন কাট ও টেকসই সেলাই। সব স্ট্যান্ডার্ড সাইজে পাওয়া যাচ্ছে।',1250.00,1120.00,NULL,NULL,50,'6107fa9d-04f4-40a8-aedc-c8bcda6d6eb5',NULL,'/backend/storage/uploads/product-images/oJkozdX3l9ON0vgzWMLuyhN2Ca6tFjpQAWIeT7AH.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:49:19','Khaki Slim Fit Gabardine Pant','খাকি স্লিম ফিট গ্যাবার্ডিন প্যান্ট','Comfortable everyday men\'s pant with a clean cut and durable stitching. Available in all standard sizes.','আরামদায়ক দৈনন্দিন পুরুষদের প্যান্ট, পরিচ্ছন্ন কাট ও টেকসই সেলাই। সব স্ট্যান্ডার্ড সাইজে পাওয়া যাচ্ছে।','Khaki Slim Fit Gabardine Pant. Comfortable everyday men\'s pant with a clean cut and durable stitching. Available in all standard sizes.','খাকি স্লিম ফিট গ্যাবার্ডিন প্যান্ট। আরামদায়ক দৈনন্দিন পুরুষদের প্যান্ট, পরিচ্ছন্ন কাট ও টেকসই সেলাই। সব স্ট্যান্ডার্ড সাইজে পাওয়া যাচ্ছে।',NULL,NULL,NULL,NULL),('486c1df2-9331-41bf-8d8e-bf06dfe344ff','ড্রাই ফিট স্পোর্টস ট্রাউজার','dry-fit-sports-trouser','ড্রাই ফিট স্পোর্টস ট্রাউজার। আরামদায়ক ওয়েস্টব্যান্ড সহ স্ট্রেচেবল স্পোর্টস ট্রাউজার — জিম, দৌড় ও ক্যাজুয়াল ব্যবহারে দারুণ।','আরামদায়ক ওয়েস্টব্যান্ড সহ স্ট্রেচেবল স্পোর্টস ট্রাউজার — জিম, দৌড় ও ক্যাজুয়াল ব্যবহারে দারুণ।',950.00,850.00,NULL,NULL,50,'6fd8eab6-71e3-47dd-9d57-d822179d290c',NULL,'/backend/storage/uploads/product-images/0qFNKWabkYDz5VO1pLlYUH12W1HTee35O5wsP91J.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:49:58','Dry Fit Sports Trouser','ড্রাই ফিট স্পোর্টস ট্রাউজার','Stretchable sports trouser with a comfortable waistband — great for gym, running and casual wear.','আরামদায়ক ওয়েস্টব্যান্ড সহ স্ট্রেচেবল স্পোর্টস ট্রাউজার — জিম, দৌড় ও ক্যাজুয়াল ব্যবহারে দারুণ।','Dry Fit Sports Trouser. Stretchable sports trouser with a comfortable waistband — great for gym, running and casual wear.','ড্রাই ফিট স্পোর্টস ট্রাউজার। আরামদায়ক ওয়েস্টব্যান্ড সহ স্ট্রেচেবল স্পোর্টস ট্রাউজার — জিম, দৌড় ও ক্যাজুয়াল ব্যবহারে দারুণ।',NULL,NULL,NULL,NULL),('48f0ec56-a8df-4d1d-be70-588bd3163aa0','পুরুষদের স্পোর্টস স্নিকার্স হোয়াইট','mens-sports-sneakers-white','পুরুষদের স্পোর্টস স্নিকার্স হোয়াইট। ব্রিদেবল আপার ও শক-অ্যাবজরবিং সোলের কুশনড স্পোর্টস স্নিকার্স।','ব্রিদেবল আপার ও শক-অ্যাবজরবিং সোলের কুশনড স্পোর্টস স্নিকার্স।',1950.00,1750.00,NULL,NULL,30,'efb2e0d8-c76e-4862-8c3d-d39340e35c6c',NULL,'/backend/storage/uploads/product-images/jNlyZIu5gasnALKv82gNr6t3YKuM2OE1V5L5Kuq4.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:50:47','Men\'s Sports Sneakers White','পুরুষদের স্পোর্টস স্নিকার্স হোয়াইট','Cushioned sports sneakers with a breathable upper and shock-absorbing sole.','ব্রিদেবল আপার ও শক-অ্যাবজরবিং সোলের কুশনড স্পোর্টস স্নিকার্স।','Men\'s Sports Sneakers White. Cushioned sports sneakers with a breathable upper and shock-absorbing sole.','পুরুষদের স্পোর্টস স্নিকার্স হোয়াইট। ব্রিদেবল আপার ও শক-অ্যাবজরবিং সোলের কুশনড স্পোর্টস স্নিকার্স।',NULL,NULL,NULL,NULL),('494ae922-a4d8-441a-900f-aec65f73a4aa','কোল্ড প্রেসড সরিষার তেল ১ লিটার','cold-pressed-mustard-oil-1l','কোল্ড প্রেসড সরিষার তেল ১ লিটার। বিশ্বস্ত স্থানীয় উৎপাদকদের কাছ থেকে সরাসরি সংগ্রহ করা খাঁটি ও কেমিক্যালমুক্ত অর্গানিক খাদ্যপণ্য।','বিশ্বস্ত স্থানীয় উৎপাদকদের কাছ থেকে সরাসরি সংগ্রহ করা খাঁটি ও কেমিক্যালমুক্ত অর্গানিক খাদ্যপণ্য।',450.00,390.00,NULL,NULL,60,'1148ec67-4236-4352-a129-dc138d6bbf68',NULL,'/backend/storage/uploads/product-images/4qwxdWZSWN3eQUHWPlBR8OvKjQCH50bzgK2nQdjD.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:51:31','Cold Pressed Mustard Oil 1L','কোল্ড প্রেসড সরিষার তেল ১ লিটার','Pure, chemical-free organic food item sourced directly from trusted local producers.','বিশ্বস্ত স্থানীয় উৎপাদকদের কাছ থেকে সরাসরি সংগ্রহ করা খাঁটি ও কেমিক্যালমুক্ত অর্গানিক খাদ্যপণ্য।','Cold Pressed Mustard Oil 1L. Pure, chemical-free organic food item sourced directly from trusted local producers.','কোল্ড প্রেসড সরিষার তেল ১ লিটার। বিশ্বস্ত স্থানীয় উৎপাদকদের কাছ থেকে সরাসরি সংগ্রহ করা খাঁটি ও কেমিক্যালমুক্ত অর্গানিক খাদ্যপণ্য।',NULL,NULL,NULL,NULL),('4fa4d0dd-cec1-4df9-86b0-f6b33e9fc825','কটন এমব্রয়ডারি সালোয়ার কামিজ','cotton-embroidered-salwar-kameez','কটন এমব্রয়ডারি সালোয়ার কামিজ। নরম ও আরামদায়ক কাপড়ের মার্জিত সালোয়ার কামিজ সেট — প্রতিদিনের ব্যবহার ও অনুষ্ঠান দুটোতেই মানানসই।','নরম ও আরামদায়ক কাপড়ের মার্জিত সালোয়ার কামিজ সেট — প্রতিদিনের ব্যবহার ও অনুষ্ঠান দুটোতেই মানানসই।',2250.00,1990.00,NULL,NULL,30,'ef025bce-1417-4a05-91c3-3754e9fef958',NULL,'/backend/storage/uploads/product-images/meEUoirZzNF69c6yVg3MFtSBznAuYEQLKPGwyVe0.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:52:28','Cotton Embroidered Salwar Kameez','কটন এমব্রয়ডারি সালোয়ার কামিজ','Elegant salwar kameez set with soft, breathable fabric — comfortable for daily wear and occasions.','নরম ও আরামদায়ক কাপড়ের মার্জিত সালোয়ার কামিজ সেট — প্রতিদিনের ব্যবহার ও অনুষ্ঠান দুটোতেই মানানসই।','Cotton Embroidered Salwar Kameez. Elegant salwar kameez set with soft, breathable fabric — comfortable for daily wear and occasions.','কটন এমব্রয়ডারি সালোয়ার কামিজ। নরম ও আরামদায়ক কাপড়ের মার্জিত সালোয়ার কামিজ সেট — প্রতিদিনের ব্যবহার ও অনুষ্ঠান দুটোতেই মানানসই।',NULL,NULL,NULL,NULL),('52db32f0-0b2c-4e6c-9a3c-fc3785f6f67e','কিডস স্পোর্টস ট্রাউজার','kids-sports-trouser','কিডস স্পোর্টস ট্রাউজার। আরামদায়ক ওয়েস্টব্যান্ড সহ স্ট্রেচেবল স্পোর্টস ট্রাউজার — জিম, দৌড় ও ক্যাজুয়াল ব্যবহারে দারুণ।','আরামদায়ক ওয়েস্টব্যান্ড সহ স্ট্রেচেবল স্পোর্টস ট্রাউজার — জিম, দৌড় ও ক্যাজুয়াল ব্যবহারে দারুণ।',750.00,650.00,NULL,NULL,40,'6fd8eab6-71e3-47dd-9d57-d822179d290c',NULL,'/backend/storage/uploads/product-images/8nhDiSsLzS19qGAFEmHbePCiImGLlDfEuAzoBdey.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:53:53','Kids Sports Trouser','কিডস স্পোর্টস ট্রাউজার','Stretchable sports trouser with a comfortable waistband — great for gym, running and casual wear.','আরামদায়ক ওয়েস্টব্যান্ড সহ স্ট্রেচেবল স্পোর্টস ট্রাউজার — জিম, দৌড় ও ক্যাজুয়াল ব্যবহারে দারুণ।','Kids Sports Trouser. Stretchable sports trouser with a comfortable waistband — great for gym, running and casual wear.','কিডস স্পোর্টস ট্রাউজার। আরামদায়ক ওয়েস্টব্যান্ড সহ স্ট্রেচেবল স্পোর্টস ট্রাউজার — জিম, দৌড় ও ক্যাজুয়াল ব্যবহারে দারুণ।',NULL,NULL,NULL,NULL),('534e9824-d2a2-4649-b3a0-2421b565869f','বেবি পার্টি ওয়্যার সু','baby-party-wear-shoes','বেবি পার্টি ওয়্যার সু। হালকা ও নমনীয় সোলের শিশুদের জুতা, স্বাভাবিক হাঁটাচলায় সহায়ক।','হালকা ও নমনীয় সোলের শিশুদের জুতা, স্বাভাবিক হাঁটাচলায় সহায়ক।',890.00,780.00,NULL,NULL,35,'263e59a2-9bdb-4510-8e1a-0ea1b3ace159',NULL,'/backend/storage/uploads/product-images/TyF0SNinNM3iB18ciBInIVMGuuNCufORPxlTZ2zx.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:53:06','Baby Party Wear Shoes','বেবি পার্টি ওয়্যার সু','Lightweight kids footwear with flexible soles that support natural walking.','হালকা ও নমনীয় সোলের শিশুদের জুতা, স্বাভাবিক হাঁটাচলায় সহায়ক।','Baby Party Wear Shoes. Lightweight kids footwear with flexible soles that support natural walking.','বেবি পার্টি ওয়্যার সু। হালকা ও নমনীয় সোলের শিশুদের জুতা, স্বাভাবিক হাঁটাচলায় সহায়ক।',NULL,NULL,NULL,NULL),('54627b35-ea2b-451a-85b6-b1cbe088f77e','মিনি হ্যান্ডহেল্ড রিচার্জেবল ফ্যান ১২০০ এমএএইচ','mini-handheld-rechargeable-fan-1200mah','মিনি হ্যান্ডহেল্ড রিচার্জেবল ফ্যান ১২০০ এমএএইচ। নির্ভরযোগ্য বিল্ড কোয়ালিটির প্রয়োজনীয় দৈনন্দিন গ্যাজেট, স্ট্যান্ডার্ড ওয়ারেন্টিসহ।','নির্ভরযোগ্য বিল্ড কোয়ালিটির প্রয়োজনীয় দৈনন্দিন গ্যাজেট, স্ট্যান্ডার্ড ওয়ারেন্টিসহ।',1150.00,990.00,NULL,NULL,35,'e83c5c5d-74d7-45b2-ba74-f4e8dd51c73b',NULL,'/backend/storage/uploads/product-images/rr6dMCiSa5HHPZ8dE4RLYZbhbpUz9vHWjfeHjqqr.webp','[\"\\/backend\\/storage\\/uploads\\/product-images\\/rr6dMCiSa5HHPZ8dE4RLYZbhbpUz9vHWjfeHjqqr.webp\"]',1,0,NULL,NULL,'2026-07-29 02:37:37','2026-07-29 02:37:37','Mini Handheld Rechargeable Fan 1200mAh','মিনি হ্যান্ডহেল্ড রিচার্জেবল ফ্যান ১২০০ এমএএইচ','Handy everyday gadget with reliable build quality and a standard warranty.','নির্ভরযোগ্য বিল্ড কোয়ালিটির প্রয়োজনীয় দৈনন্দিন গ্যাজেট, স্ট্যান্ডার্ড ওয়ারেন্টিসহ।','Mini Handheld Rechargeable Fan 1200mAh. Handy everyday gadget with reliable build quality and a standard warranty.','মিনি হ্যান্ডহেল্ড রিচার্জেবল ফ্যান ১২০০ এমএএইচ। নির্ভরযোগ্য বিল্ড কোয়ালিটির প্রয়োজনীয় দৈনন্দিন গ্যাজেট, স্ট্যান্ডার্ড ওয়ারেন্টিসহ।',NULL,NULL,NULL,NULL),('586e415d-9f54-4841-b4d2-2f08cbaac49c','পুরুষদের গোল্ডেন স্কেলিটন ডায়াল ঘড়ি','mens-golden-skeleton-dial-watch','পুরুষদের গোল্ডেন স্কেলিটন ডায়াল ঘড়ি। নির্ভরযোগ্য মুভমেন্ট ও আরামদায়ক স্ট্র্যাপের দৈনন্দিন হাতঘড়ি। সার্ভিস ওয়ারেন্টিসহ।','নির্ভরযোগ্য মুভমেন্ট ও আরামদায়ক স্ট্র্যাপের দৈনন্দিন হাতঘড়ি। সার্ভিস ওয়ারেন্টিসহ।',3450.00,2950.00,NULL,NULL,22,'0de82e19-70fa-41b8-863f-7797f0a59bfe',NULL,'/backend/storage/uploads/product-images/hvHXF8nmLPgkjqs8TAnWzI38hbfuE60rPCjGqQis.webp','[\"\\/backend\\/storage\\/uploads\\/product-images\\/hvHXF8nmLPgkjqs8TAnWzI38hbfuE60rPCjGqQis.webp\"]',1,1,NULL,NULL,'2026-07-29 02:37:37','2026-07-29 02:37:37','Men\'s Golden Skeleton Dial Watch','পুরুষদের গোল্ডেন স্কেলিটন ডায়াল ঘড়ি','Everyday wristwatch with a reliable movement and a comfortable strap. Backed by a service warranty.','নির্ভরযোগ্য মুভমেন্ট ও আরামদায়ক স্ট্র্যাপের দৈনন্দিন হাতঘড়ি। সার্ভিস ওয়ারেন্টিসহ।','Men\'s Golden Skeleton Dial Watch. Everyday wristwatch with a reliable movement and a comfortable strap. Backed by a service warranty.','পুরুষদের গোল্ডেন স্কেলিটন ডায়াল ঘড়ি। নির্ভরযোগ্য মুভমেন্ট ও আরামদায়ক স্ট্র্যাপের দৈনন্দিন হাতঘড়ি। সার্ভিস ওয়ারেন্টিসহ।',NULL,NULL,NULL,NULL),('63297431-18fc-4ef1-8592-db605e322725','হাই অ্যাঙ্কেল বাস্কেটবল স্নিকার্স','high-ankle-basketball-sneakers','হাই অ্যাঙ্কেল বাস্কেটবল স্নিকার্স। ব্রিদেবল আপার ও শক-অ্যাবজরবিং সোলের কুশনড স্পোর্টস স্নিকার্স।','ব্রিদেবল আপার ও শক-অ্যাবজরবিং সোলের কুশনড স্পোর্টস স্নিকার্স।',2450.00,2150.00,NULL,NULL,22,'efb2e0d8-c76e-4862-8c3d-d39340e35c6c',NULL,'/backend/storage/uploads/product-images/5EUmmMY94gEiqb7b1vs9iPMKtyC9xdl7VYxPVE5k.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 01:54:36','High Ankle Basketball Sneakers','হাই অ্যাঙ্কেল বাস্কেটবল স্নিকার্স','Cushioned sports sneakers with a breathable upper and shock-absorbing sole.','ব্রিদেবল আপার ও শক-অ্যাবজরবিং সোলের কুশনড স্পোর্টস স্নিকার্স।','High Ankle Basketball Sneakers. Cushioned sports sneakers with a breathable upper and shock-absorbing sole.','হাই অ্যাঙ্কেল বাস্কেটবল স্নিকার্স। ব্রিদেবল আপার ও শক-অ্যাবজরবিং সোলের কুশনড স্পোর্টস স্নিকার্স।',NULL,NULL,NULL,NULL),('936fdeac-c2a4-41b4-a41e-39519408e775','হেলথকেয়ার ফার্মাসিউটিক্যালস লিমিটেড','smart-electric-scalp-massager','স্মার্ট ইলেকট্রিক স্ক্যাল্প ম্যাসাজার। আসল হেলথ কেয়ার পণ্য, প্রতিটি প্যাকে স্পষ্ট ব্যাচ ও মেয়াদ উত্তীর্ণের তারিখ দেওয়া।','আসল হেলথ কেয়ার পণ্য, প্রতিটি প্যাকে স্পষ্ট ব্যাচ ও মেয়াদ উত্তীর্ণের তারিখ দেওয়া।',1450.00,1190.00,NULL,NULL,30,'2a73b178-e0b0-4173-8c1a-a40e3cacb7f3',NULL,'/backend/storage/uploads/product-images/5Q7mGKEX9KfHcQGA6DQeyiRIMxTBO4dofNXQwvHg.webp','[]',1,0,NULL,NULL,'2026-07-29 02:37:37','2026-07-29 02:43:43','Healthcare Pharmacuticals Ltd','হেলথকেয়ার ফার্মাসিউটিক্যালস লিমিটেড','Authentic health care item with a readable batch and expiry date on every pack.','আসল হেলথ কেয়ার পণ্য, প্রতিটি প্যাকে স্পষ্ট ব্যাচ ও মেয়াদ উত্তীর্ণের তারিখ দেওয়া।','Smart Electric Scalp Massager. Authentic health care item with a readable batch and expiry date on every pack.','স্মার্ট ইলেকট্রিক স্ক্যাল্প ম্যাসাজার। আসল হেলথ কেয়ার পণ্য, প্রতিটি প্যাকে স্পষ্ট ব্যাচ ও মেয়াদ উত্তীর্ণের তারিখ দেওয়া।',NULL,NULL,NULL,NULL),('96337fdf-cf3e-4e20-a724-68ea33a374e9','গ্রে মেলাঞ্জ হাফ স্লিভ টি-শার্ট','gray-melange-half-sleeve-t-shirt-1784643893-6','বহুমুখী গ্রে মেলাঞ্জ হাফ স্লিভ টি-শার্ট। সকল মৌসুমের জন্য উপযুক্ত।',NULL,650.00,450.00,NULL,NULL,48,'230d95a7-68a6-4aba-a991-6115107cc1fe',NULL,'/backend/storage/uploads/product-images/HrBwZcccbO5uOwDzDI2gOl2MphmNEgdHYxlKbHvA.webp','[]',1,0,NULL,NULL,'2026-07-21 08:24:53','2026-07-26 01:11:07','Gray Melange Half Sleeve T-Shirt','গ্রে মেলাঞ্জ হাফ স্লিভ টি-শার্ট',NULL,NULL,'Versatile gray melange half sleeve t-shirt. Perfect for all seasons.','বহুমুখী গ্রে মেলাঞ্জ হাফ স্লিভ টি-শার্ট। সকল মৌসুমের জন্য উপযুক্ত।',NULL,NULL,NULL,NULL),('a93a96ae-8194-49f3-b10b-bea375452193','স্প্রিং ভ্যালি এল-আরজিনিন | ৫০০ মি.গ্রা. | ৫০টি','memory-foam-neck-support-pillow','মেমোরি ফোম নেক সাপোর্ট পিলো। আসল হেলথ কেয়ার পণ্য, প্রতিটি প্যাকে স্পষ্ট ব্যাচ ও মেয়াদ উত্তীর্ণের তারিখ দেওয়া।','আসল হেলথ কেয়ার পণ্য, প্রতিটি প্যাকে স্পষ্ট ব্যাচ ও মেয়াদ উত্তীর্ণের তারিখ দেওয়া।',950.00,790.00,NULL,NULL,40,'2a73b178-e0b0-4173-8c1a-a40e3cacb7f3',NULL,'/backend/storage/uploads/product-images/NrsITEM5hLUJRF439iwwV4VDkLkTiOhC3LsfNGDJ.webp','[]',1,0,NULL,NULL,'2026-07-29 02:37:37','2026-07-29 02:45:30','Spring Valley L-Arginine | 500mg | 50 Count','স্প্রিং ভ্যালি এল-আরজিনিন | ৫০০ মি.গ্রা. | ৫০টি','Authentic health care item with a readable batch and expiry date on every pack.','আসল হেলথ কেয়ার পণ্য, প্রতিটি প্যাকে স্পষ্ট ব্যাচ ও মেয়াদ উত্তীর্ণের তারিখ দেওয়া।','Memory Foam Neck Support Pillow. Authentic health care item with a readable batch and expiry date on every pack.','মেমোরি ফোম নেক সাপোর্ট পিলো। আসল হেলথ কেয়ার পণ্য, প্রতিটি প্যাকে স্পষ্ট ব্যাচ ও মেয়াদ উত্তীর্ণের তারিখ দেওয়া।',NULL,NULL,NULL,NULL),('b2000000-0000-4000-8000-000000000001','প্রিমিয়াম ব্ল্যাক ক্রসবডি মেসেঞ্জার ব্যাগ','premium-black-crossbody-messenger-bag','সিকিউর ফ্ল্যাপ ক্লোজার, গোছানো ইনার স্পেস ও আরামদায়ক অ্যাডজাস্টেবল স্ট্র্যাপসহ দৈনন্দিন ব্যবহারের কমপ্যাক্ট মেসেঞ্জার ব্যাগ।','অ্যাডজাস্টেবল শোল্ডার স্ট্র্যাপসহ স্মার্ট ফক্স-লেদার ক্রসবডি ব্যাগ।',1650.00,1390.00,945.00,'FM-MB-001',18,'ff9ff721-410c-4aba-898b-d4005aeef312',NULL,'/assets/uploads/product-images/fashion/premium-black-crossbody-messenger-bag.webp','[]',1,1,'১','পিস','2026-07-21 08:24:52','2026-07-21 08:24:52','Premium Black Crossbody Messenger Bag','প্রিমিয়াম ব্ল্যাক ক্রসবডি মেসেঞ্জার ব্যাগ','Smart faux-leather crossbody bag with an adjustable shoulder strap.','অ্যাডজাস্টেবল শোল্ডার স্ট্র্যাপসহ স্মার্ট ফক্স-লেদার ক্রসবডি ব্যাগ।','A compact everyday messenger bag with a secure flap closure, organized inner space and a comfortable adjustable strap.','সিকিউর ফ্ল্যাপ ক্লোজার, গোছানো ইনার স্পেস ও আরামদায়ক অ্যাডজাস্টেবল স্ট্র্যাপসহ দৈনন্দিন ব্যবহারের কমপ্যাক্ট মেসেঞ্জার ব্যাগ।','1','১','piece','পিস'),('b2000000-0000-4000-8000-000000000002','ক্লাসিক ব্রাউন লেদার ব্যাকপ্যাক','classic-brown-leather-backpack','প্যাডেড শোল্ডার স্ট্র্যাপ, একাধিক জিপ কম্পার্টমেন্ট ও ক্লাসিক লেদার-লুক ফিনিশসহ টেকসই এবং প্রশস্ত ব্যাকপ্যাক।','কাজ ও ভ্রমণের জন্য একাধিক পকেটসহ প্রশস্ত ব্রাউন ব্যাকপ্যাক।',2250.00,1890.00,1285.00,'FM-MB-002',12,'ff9ff721-410c-4aba-898b-d4005aeef312',NULL,'/assets/uploads/product-images/fashion/classic-brown-leather-backpack.webp','[]',1,0,'১','পিস','2026-07-21 08:24:53','2026-07-21 08:24:52','Classic Brown Leather Backpack','ক্লাসিক ব্রাউন লেদার ব্যাকপ্যাক','Spacious brown backpack with multiple pockets for work and travel.','কাজ ও ভ্রমণের জন্য একাধিক পকেটসহ প্রশস্ত ব্রাউন ব্যাকপ্যাক।','A durable, roomy backpack with padded shoulder straps, multiple zip compartments and a timeless leather-look finish.','প্যাডেড শোল্ডার স্ট্র্যাপ, একাধিক জিপ কম্পার্টমেন্ট ও ক্লাসিক লেদার-লুক ফিনিশসহ টেকসই এবং প্রশস্ত ব্যাকপ্যাক।','1','১','piece','পিস'),('b2000000-0000-4000-8000-000000000003','এলিগ্যান্ট বেইজ কুইল্টেড শোল্ডার ব্যাগ','elegant-beige-quilted-shoulder-bag','সফট কুইল্টেড টেক্সচার, সিকিউর ক্ল্যাস্প ও বহুমুখী চেইন স্ট্র্যাপসহ পরিপাটি কমপ্যাক্ট শোল্ডার ব্যাগ।','পলিশড গোল্ড-টোন চেইন স্ট্র্যাপসহ এলিগ্যান্ট কুইল্টেড হ্যান্ডব্যাগ।',1750.00,1450.00,986.00,'FM-LB-001',16,'ff9ff721-410c-4aba-898b-d4005aeef312',NULL,'/assets/uploads/product-images/fashion/elegant-beige-quilted-shoulder-bag.webp','[]',1,1,'১','পিস','2026-07-21 08:24:54','2026-07-21 08:24:52','Elegant Beige Quilted Shoulder Bag','এলিগ্যান্ট বেইজ কুইল্টেড শোল্ডার ব্যাগ','Elegant quilted handbag with a polished gold-tone chain strap.','পলিশড গোল্ড-টোন চেইন স্ট্র্যাপসহ এলিগ্যান্ট কুইল্টেড হ্যান্ডব্যাগ।','A refined compact shoulder bag featuring soft quilted texture, a secure clasp and a versatile chain strap.','সফট কুইল্টেড টেক্সচার, সিকিউর ক্ল্যাস্প ও বহুমুখী চেইন স্ট্র্যাপসহ পরিপাটি কমপ্যাক্ট শোল্ডার ব্যাগ।','1','১','piece','পিস'),('b2000000-0000-4000-8000-000000000004','মডার্ন মেরুন টোট ব্যাগ','modern-maroon-tote-bag','মজবুত ডাবল হ্যান্ডেল, পরিপাটি স্টিচিং ও দৈনন্দিন প্রয়োজনীয় জিনিস রাখার পর্যাপ্ত জায়গাসহ স্টাইলিশ টোট ব্যাগ।','পরিষ্কার ও বহুমুখী ডিজাইনের প্রশস্ত মেরুন টোট ব্যাগ।',1550.00,1290.00,877.00,'FM-LB-002',20,'ff9ff721-410c-4aba-898b-d4005aeef312',NULL,'/assets/uploads/product-images/fashion/modern-maroon-tote-bag.webp','[]',1,0,'১','পিস','2026-07-21 08:24:55','2026-07-21 08:24:52','Modern Maroon Tote Bag','মডার্ন মেরুন টোট ব্যাগ','Roomy maroon tote bag with a clean, versatile everyday design.','পরিষ্কার ও বহুমুখী ডিজাইনের প্রশস্ত মেরুন টোট ব্যাগ।','A stylish everyday tote with sturdy double handles, neat stitching and enough room for daily essentials.','মজবুত ডাবল হ্যান্ডেল, পরিপাটি স্টিচিং ও দৈনন্দিন প্রয়োজনীয় জিনিস রাখার পর্যাপ্ত জায়গাসহ স্টাইলিশ টোট ব্যাগ।','1','১','piece','পিস'),('b2000000-0000-4000-8000-000000000005','রয়্যাল উদ ইও ডি পারফিউম ১০০ মি.লি.','royal-oud-eau-de-parfum-100ml','গভীর উদ, উষ্ণ অ্যাম্বার ও মসৃণ উডি নোটের মিশ্রণে তৈরি দীর্ঘস্থায়ী ও এলিগ্যান্ট ওরিয়েন্টাল সুগন্ধি।','উষ্ণ উডি ও অ্যাম্বার নোটের সমৃদ্ধ ইউনিসেক্স উদ সুগন্ধি।',1950.00,1650.00,1122.00,'FM-PF-001',14,'c9b25fb8-b8dc-4309-9a99-37a94e8a2526',NULL,'/assets/uploads/product-images/fashion/royal-oud-eau-de-parfum-100ml.webp','[]',1,1,'১','পিস','2026-07-21 08:24:56','2026-07-21 08:24:52','Royal Oud Eau De Parfum 100ml','রয়্যাল উদ ইও ডি পারফিউম ১০০ মি.লি.','A rich unisex oud fragrance with warm woody and amber notes.','উষ্ণ উডি ও অ্যাম্বার নোটের সমৃদ্ধ ইউনিসেক্স উদ সুগন্ধি।','A long-lasting oriental fragrance blending deep oud, warm amber and smooth woody notes for an elegant finish.','গভীর উদ, উষ্ণ অ্যাম্বার ও মসৃণ উডি নোটের মিশ্রণে তৈরি দীর্ঘস্থায়ী ও এলিগ্যান্ট ওরিয়েন্টাল সুগন্ধি।','1','১','piece','পিস'),('b2000000-0000-4000-8000-000000000006','ব্লাশ ব্লুম ইও ডি পারফিউম ৮০ মি.লি.','blush-bloom-eau-de-parfum-80ml','ফ্রেশ ফ্লোরাল নোট দিয়ে শুরু হয়ে সফট ও ক্লিন মাস্ক বেসে মিশে যাওয়া দৈনন্দিন ব্যবহারের স্নিগ্ধ পারফিউম।','সফট রোজ, জেসমিন ও মাস্ক নোটের ফ্রেশ ফ্লোরাল সুগন্ধি।',1650.00,1390.00,945.00,'FM-PF-002',18,'c9b25fb8-b8dc-4309-9a99-37a94e8a2526',NULL,'/assets/uploads/product-images/fashion/blush-bloom-eau-de-parfum-80ml.webp','[]',1,0,'১','পিস','2026-07-21 08:24:57','2026-07-21 08:24:52','Blush Bloom Eau De Parfum 80ml','ব্লাশ ব্লুম ইও ডি পারফিউম ৮০ মি.লি.','A fresh floral fragrance with soft rose, jasmine and musk notes.','সফট রোজ, জেসমিন ও মাস্ক নোটের ফ্রেশ ফ্লোরাল সুগন্ধি।','A graceful everyday perfume opening with fresh florals and settling into a soft, clean musk base.','ফ্রেশ ফ্লোরাল নোট দিয়ে শুরু হয়ে সফট ও ক্লিন মাস্ক বেসে মিশে যাওয়া দৈনন্দিন ব্যবহারের স্নিগ্ধ পারফিউম।','1','১','piece','পিস'),('b3000000-0000-4000-8000-000000000001','লার্জ ক্যানভাস এভরিডে টোট ব্যাগ','large-canvas-everyday-tote-bag','নিউট্রাল ক্যানভাস বডি, কনট্রাস্ট ট্রিম ও আরামদায়ক লং হ্যান্ডেলসহ হালকা এবং প্রশস্ত দৈনন্দিন টোট ব্যাগ।','আরামদায়ক ব্রাউন শোল্ডার হ্যান্ডেলসহ প্রশস্ত ক্যানভাস টোট ব্যাগ।',1290.00,1090.00,740.00,'FM-LB-003',20,'ff9ff721-410c-4aba-898b-d4005aeef312',NULL,'/assets/uploads/product-images/ladies-bag/large-canvas-everyday-tote-bag.webp','[]',1,1,'১','পিস','2026-07-21 08:24:52','2026-07-21 08:24:52','Large Canvas Everyday Tote Bag','লার্জ ক্যানভাস এভরিডে টোট ব্যাগ','A roomy canvas tote with comfortable brown shoulder handles.','আরামদায়ক ব্রাউন শোল্ডার হ্যান্ডেলসহ প্রশস্ত ক্যানভাস টোট ব্যাগ।','A lightweight and spacious everyday tote with a neutral canvas body, contrasting trim and long handles for comfortable carrying.','নিউট্রাল ক্যানভাস বডি, কনট্রাস্ট ট্রিম ও আরামদায়ক লং হ্যান্ডেলসহ হালকা এবং প্রশস্ত দৈনন্দিন টোট ব্যাগ।','1','১','piece','পিস'),('b3000000-0000-4000-8000-000000000002','ক্লাসিক ব্রাউন মনোগ্রাম হ্যান্ডব্যাগ','classic-brown-monogram-handbag','প্যাটার্নড বডি, সিকিউর মেটাল ক্ল্যাস্প ও বহুমুখী ব্যবহারের ডিট্যাচেবল স্ট্র্যাপসহ এলিগ্যান্ট টপ-হ্যান্ডেল ব্যাগ।','ডিট্যাচেবল শোল্ডার স্ট্র্যাপসহ স্ট্রাকচার্ড ব্রাউন হ্যান্ডব্যাগ।',1850.00,1590.00,1080.00,'FM-LB-004',14,'ff9ff721-410c-4aba-898b-d4005aeef312',NULL,'/assets/uploads/product-images/ladies-bag/classic-brown-monogram-handbag.webp','[]',1,1,'১','পিস','2026-07-21 08:24:53','2026-07-21 08:24:52','Classic Brown Monogram Handbag','ক্লাসিক ব্রাউন মনোগ্রাম হ্যান্ডব্যাগ','Structured brown handbag with a detachable shoulder strap.','ডিট্যাচেবল শোল্ডার স্ট্র্যাপসহ স্ট্রাকচার্ড ব্রাউন হ্যান্ডব্যাগ।','An elegant top-handle handbag featuring a patterned body, secure metal clasp and a detachable strap for versatile styling.','প্যাটার্নড বডি, সিকিউর মেটাল ক্ল্যাস্প ও বহুমুখী ব্যবহারের ডিট্যাচেবল স্ট্র্যাপসহ এলিগ্যান্ট টপ-হ্যান্ডেল ব্যাগ।','1','১','piece','পিস'),('b3000000-0000-4000-8000-000000000003','অলিভ ড্রস্ট্রিং ক্যানভাস টোট ব্যাগ','olive-drawstring-canvas-tote-bag','লং শোল্ডার স্ট্র্যাপ, জিপযুক্ত মেইন ওপেনিং ও ডেকোরেটিভ ড্রস্ট্রিং ফ্রন্ট পকেটসহ ব্যবহারিক হালকা টোট ব্যাগ।','ড্রস্ট্রিং ফ্রন্ট পকেটসহ ক্যাজুয়াল অলিভ ক্যানভাস টোট ব্যাগ।',990.00,850.00,578.00,'FM-LB-005',24,'ff9ff721-410c-4aba-898b-d4005aeef312',NULL,'/assets/uploads/product-images/ladies-bag/olive-drawstring-canvas-tote-bag.webp','[]',1,0,'১','পিস','2026-07-21 08:24:54','2026-07-21 08:24:52','Olive Drawstring Canvas Tote Bag','অলিভ ড্রস্ট্রিং ক্যানভাস টোট ব্যাগ','Casual olive canvas tote with a drawstring front pocket.','ড্রস্ট্রিং ফ্রন্ট পকেটসহ ক্যাজুয়াল অলিভ ক্যানভাস টোট ব্যাগ।','A practical lightweight tote with long shoulder straps, a zipped main opening and a decorative drawstring front pocket.','লং শোল্ডার স্ট্র্যাপ, জিপযুক্ত মেইন ওপেনিং ও ডেকোরেটিভ ড্রস্ট্রিং ফ্রন্ট পকেটসহ ব্যবহারিক হালকা টোট ব্যাগ।','1','১','piece','পিস'),('b3000000-0000-4000-8000-000000000004','প্রিমিয়াম সিক্স-পিস হ্যান্ডব্যাগ সেট','premium-six-piece-handbag-set','বিভিন্ন সাইজের হ্যান্ডব্যাগ ও কমপ্যাক্ট পার্সসহ সম্পূর্ণ ম্যাচিং সেট, যা অফিস, শপিং ও বিশেষ অনুষ্ঠানের জন্য উপযোগী।','ম্যাচিং হ্যান্ডব্যাগ ও পার্সের ছয়-পিস কালেকশন।',2790.00,2390.00,1625.00,'FM-LB-006',10,'ff9ff721-410c-4aba-898b-d4005aeef312',NULL,'/assets/uploads/product-images/ladies-bag/premium-six-piece-handbag-set.webp','[]',1,1,'১','পিস','2026-07-21 08:24:55','2026-07-21 08:24:52','Premium Six-Piece Handbag Set','প্রিমিয়াম সিক্স-পিস হ্যান্ডব্যাগ সেট','A coordinated six-piece handbag and purse collection.','ম্যাচিং হ্যান্ডব্যাগ ও পার্সের ছয়-পিস কালেকশন।','A complete matching set with multiple handbag sizes and compact purses, suitable for work, shopping and special occasions.','বিভিন্ন সাইজের হ্যান্ডব্যাগ ও কমপ্যাক্ট পার্সসহ সম্পূর্ণ ম্যাচিং সেট, যা অফিস, শপিং ও বিশেষ অনুষ্ঠানের জন্য উপযোগী।','1','১','piece','পিস'),('b3000000-0000-4000-8000-000000000005','ক্লাসিক ক্রিসেন্ট শোল্ডার ব্যাগ - মাল্টিপল কালার','classic-crescent-shoulder-bag-multicolor','কনট্রাস্ট ট্রিম, সিকিউর জিপ ক্লোজার ও আরামদায়ক লং হ্যান্ডেলসহ বিভিন্ন রঙের কমপ্যাক্ট ক্রিসেন্ট শোল্ডার ব্যাগ।','একাধিক এলিগ্যান্ট কালারে পাওয়া যায় এমন কার্ভড এভরিডে শোল্ডার ব্যাগ।',1950.00,1690.00,1149.00,'FM-LB-007',18,'ff9ff721-410c-4aba-898b-d4005aeef312',NULL,'/assets/uploads/product-images/ladies-bag/classic-crescent-shoulder-bag-multicolor.webp','[]',1,0,'১','পিস','2026-07-21 08:24:56','2026-07-21 08:24:52','Classic Crescent Shoulder Bag - Multiple Colors','ক্লাসিক ক্রিসেন্ট শোল্ডার ব্যাগ - মাল্টিপল কালার','Curved everyday shoulder bag available in multiple elegant colors.','একাধিক এলিগ্যান্ট কালারে পাওয়া যায় এমন কার্ভড এভরিডে শোল্ডার ব্যাগ।','A compact crescent-shaped shoulder bag with contrast trim, secure zip closure and a comfortable long handle in assorted colors.','কনট্রাস্ট ট্রিম, সিকিউর জিপ ক্লোজার ও আরামদায়ক লং হ্যান্ডেলসহ বিভিন্ন রঙের কমপ্যাক্ট ক্রিসেন্ট শোল্ডার ব্যাগ।','1','১','piece','পিস'),('b3f11a86-0277-4ae3-9fcf-531a3151104f','স্লিভ সহ গ্লাস ফিডিং বোতল ২৪০ মিলি','glass-feeding-bottle-with-sleeve-240ml-copy-1785309787712','স্লিভ সহ গ্লাস ফিডিং বোতল ২৪০ মিলি। বিপিএ ফ্রি ফিডিং বোতল, অ্যান্টি-কলিক নিপল সহ — নিরাপদ, সহজে পরিষ্কার ও জীবাণুমুক্ত করা যায়।','বিপিএ ফ্রি ফিডিং বোতল, অ্যান্টি-কলিক নিপল সহ — নিরাপদ, সহজে পরিষ্কার ও জীবাণুমুক্ত করা যায়।',850.00,750.00,NULL,NULL,35,'f47cf9de-6d6c-4046-8c99-e433f62c24d4',NULL,'/backend/storage/uploads/product-images/ZtVBcXiTsUMp0N2bkpIgW59FmbYlH6AlC0vhDJQK.webp','[]',1,0,NULL,NULL,'2026-07-29 01:23:08','2026-07-29 01:26:22','Glass Feeding Bottle with Sleeve 240ml','স্লিভ সহ গ্লাস ফিডিং বোতল ২৪০ মিলি','BPA-free feeding bottle with an anti-colic nipple — safe, easy to clean and sterilise.','বিপিএ ফ্রি ফিডিং বোতল, অ্যান্টি-কলিক নিপল সহ — নিরাপদ, সহজে পরিষ্কার ও জীবাণুমুক্ত করা যায়।','Glass Feeding Bottle with Sleeve 240ml. BPA-free feeding bottle with an anti-colic nipple — safe, easy to clean and sterilise.','স্লিভ সহ গ্লাস ফিডিং বোতল ২৪০ মিলি। বিপিএ ফ্রি ফিডিং বোতল, অ্যান্টি-কলিক নিপল সহ — নিরাপদ, সহজে পরিষ্কার ও জীবাণুমুক্ত করা যায়।',NULL,NULL,NULL,NULL),('b4000000-0000-4000-8000-000000000001','ভিনটেজ ব্রাউন ল্যাপটপ ব্রিফকেস','vintage-brown-laptop-briefcase','একাধিক জিপ কম্পার্টমেন্ট, গোছানো ফ্রন্ট পকেট, মজবুত ক্যারি হ্যান্ডেল ও ডিট্যাচেবল শোল্ডার স্ট্র্যাপসহ টেকসই অফিস ব্যাগ।','হ্যান্ডেল ও অ্যাডজাস্টেবল স্ট্র্যাপসহ প্রশস্ত ভিনটেজ-লুক ব্রিফকেস।',2450.00,2090.00,1421.00,'FM-MB-003',15,'ff9ff721-410c-4aba-898b-d4005aeef312',NULL,'/assets/uploads/product-images/mans-bag/vintage-brown-laptop-briefcase.webp','[]',1,1,'১','পিস','2026-07-21 08:24:52','2026-07-21 08:24:52','Vintage Brown Laptop Briefcase','ভিনটেজ ব্রাউন ল্যাপটপ ব্রিফকেস','Spacious vintage-look briefcase with handles and an adjustable strap.','হ্যান্ডেল ও অ্যাডজাস্টেবল স্ট্র্যাপসহ প্রশস্ত ভিনটেজ-লুক ব্রিফকেস।','A durable work bag with multiple zipped compartments, organized front pockets, sturdy carry handles and a detachable shoulder strap.','একাধিক জিপ কম্পার্টমেন্ট, গোছানো ফ্রন্ট পকেট, মজবুত ক্যারি হ্যান্ডেল ও ডিট্যাচেবল শোল্ডার স্ট্র্যাপসহ টেকসই অফিস ব্যাগ।','1','১','piece','পিস'),('b4000000-0000-4000-8000-000000000002','এক্সিকিউটিভ ব্ল্যাক ল্যাপটপ ব্রিফকেস','executive-black-laptop-briefcase','ওয়াইড জিপ ওপেনিং, স্ট্রাকচার্ড হ্যান্ডেল এবং ল্যাপটপ, নোটবুক ও দৈনন্দিন প্রয়োজনীয় জিনিসের গোছানো কম্পার্টমেন্টসহ স্মার্ট প্রফেশনাল ব্রিফকেস।','ল্যাপটপ ও ডকুমেন্টের প্যাডেড স্পেসসহ স্লিম ব্ল্যাক অফিস ব্যাগ।',2150.00,1790.00,1217.00,'FM-MB-004',18,'ff9ff721-410c-4aba-898b-d4005aeef312',NULL,'/assets/uploads/product-images/mans-bag/executive-black-laptop-briefcase.webp','[]',1,0,'১','পিস','2026-07-21 08:24:53','2026-07-21 08:24:52','Executive Black Laptop Briefcase','এক্সিকিউটিভ ব্ল্যাক ল্যাপটপ ব্রিফকেস','Slim black office bag with padded space for a laptop and documents.','ল্যাপটপ ও ডকুমেন্টের প্যাডেড স্পেসসহ স্লিম ব্ল্যাক অফিস ব্যাগ।','A smart professional briefcase featuring a wide zipped opening, structured handles and organized compartments for a laptop, notebook and daily essentials.','ওয়াইড জিপ ওপেনিং, স্ট্রাকচার্ড হ্যান্ডেল এবং ল্যাপটপ, নোটবুক ও দৈনন্দিন প্রয়োজনীয় জিনিসের গোছানো কম্পার্টমেন্টসহ স্মার্ট প্রফেশনাল ব্রিফকেস।','1','১','piece','পিস'),('c3000000-0000-4000-8000-000000000001','মিডনাইট অ্যাজুর ইও ডি পারফিউম ১০০ মি.লি.','midnight-azure-eau-de-parfum-100ml','ক্রিস্প সিট্রাস ও মেরিন সুবাস দিয়ে শুরু হয়ে মসৃণ উডি বেসে মিশে যাওয়া পরিশীলিত ও দীর্ঘস্থায়ী পারফিউম।','সিট্রাস, মেরিন ও গভীর উডি নোটের পরিশীলিত সতেজ সুগন্ধি।',1850.00,1550.00,1054.00,'FM-PF-003',16,'c9b25fb8-b8dc-4309-9a99-37a94e8a2526',NULL,'/assets/uploads/product-images/catalog-20260719/midnight-azure-eau-de-parfum-100ml.png','[]',1,0,'১০০','মি.লি.','2026-07-21 08:24:52','2026-07-21 08:24:52','Midnight Azure Eau De Parfum 100ml','মিডনাইট অ্যাজুর ইও ডি পারফিউম ১০০ মি.লি.','A sophisticated fresh fragrance with citrus, marine and deep woody notes.','সিট্রাস, মেরিন ও গভীর উডি নোটের পরিশীলিত সতেজ সুগন্ধি।','A refined long-lasting perfume that opens with crisp citrus and marine accords before settling into a smooth woody base.','ক্রিস্প সিট্রাস ও মেরিন সুবাস দিয়ে শুরু হয়ে মসৃণ উডি বেসে মিশে যাওয়া পরিশীলিত ও দীর্ঘস্থায়ী পারফিউম।','100','১০০','ml','মি.লি.'),('c3000000-0000-4000-8000-000000000002','রোজ ভেলভেট ইও ডি পারফিউম ৭৫ মি.লি.','rose-velvet-eau-de-parfum-75ml','উজ্জ্বল রোজ ও পিওনি নোটের সঙ্গে পরিষ্কার ভেলভেটি হোয়াইট মাস্ক বেসের এলিগ্যান্ট দৈনন্দিন সুগন্ধি।','রোজ পেটাল, পিওনি ও উষ্ণ হোয়াইট মাস্কের কোমল ফ্লোরাল সুগন্ধি।',1450.00,1190.00,809.00,'FM-PF-004',20,'c9b25fb8-b8dc-4309-9a99-37a94e8a2526',NULL,'/assets/uploads/product-images/catalog-20260719/rose-velvet-eau-de-parfum-75ml.png','[]',1,0,'৭৫','মি.লি.','2026-07-21 08:24:53','2026-07-21 08:24:52','Rose Velvet Eau De Parfum 75ml','রোজ ভেলভেট ইও ডি পারফিউম ৭৫ মি.লি.','A soft floral perfume blending rose petals, peony and warm white musk.','রোজ পেটাল, পিওনি ও উষ্ণ হোয়াইট মাস্কের কোমল ফ্লোরাল সুগন্ধি।','An elegant everyday fragrance with luminous rose and peony notes layered over a clean, velvety white musk base.','উজ্জ্বল রোজ ও পিওনি নোটের সঙ্গে পরিষ্কার ভেলভেটি হোয়াইট মাস্ক বেসের এলিগ্যান্ট দৈনন্দিন সুগন্ধি।','75','৭৫','ml','মি.লি.'),('c3000000-0000-4000-8000-000000000003','আরবান ব্ল্যাক ইনসুলেটেড বোতল ৭৫০ মি.লি.','urban-black-insulated-bottle-750ml','পানীয়ের তাপমাত্রা ধরে রাখার জন্য ডাবল-ওয়াল স্টেইনলেস-স্টিল বোতল, সঙ্গে লিক-রেজিস্ট্যান্ট স্ক্রু ক্যাপ ও ক্যারি লুপ।','সুবিধাজনক ক্যারি লুপসহ টেকসই ম্যাট-ব্ল্যাক ইনসুলেটেড বোতল।',950.00,790.00,537.00,'FM-WB-002',28,'d487b6b4-e5cf-42ee-816b-bc79e2c34eca',NULL,'/assets/uploads/product-images/catalog-20260719/urban-black-insulated-bottle-750ml.png','[]',1,0,'৭৫০','মি.লি.','2026-07-21 08:24:54','2026-07-21 08:24:52','Urban Black Insulated Bottle 750ml','আরবান ব্ল্যাক ইনসুলেটেড বোতল ৭৫০ মি.লি.','A durable matte-black insulated bottle with a convenient carry loop.','সুবিধাজনক ক্যারি লুপসহ টেকসই ম্যাট-ব্ল্যাক ইনসুলেটেড বোতল।','A double-wall stainless-steel bottle designed to keep drinks at temperature, with a leak-resistant screw cap and carry loop.','পানীয়ের তাপমাত্রা ধরে রাখার জন্য ডাবল-ওয়াল স্টেইনলেস-স্টিল বোতল, সঙ্গে লিক-রেজিস্ট্যান্ট স্ক্রু ক্যাপ ও ক্যারি লুপ।','750','৭৫০','ml','মি.লি.'),('c3000000-0000-4000-8000-000000000004','অ্যাক্টিভ ল্যাভেন্ডার স্পোর্টস বোতল ১ লিটার','active-lavender-sports-bottle-1l','ওয়ান-টাচ ফ্লিপ লিড, সেফটি লক, আরামদায়ক গ্রিপ ও বিল্ট-ইন হ্যান্ডেলসহ প্রশস্ত দৈনন্দিন পানির বোতল।','লকযোগ্য ফ্লিপ লিড ও ক্যারি হ্যান্ডেলসহ হালকা স্পোর্টস বোতল।',750.00,620.00,422.00,'FM-WB-003',32,'d487b6b4-e5cf-42ee-816b-bc79e2c34eca',NULL,'/assets/uploads/product-images/catalog-20260719/active-lavender-sports-bottle-1l.png','[]',1,0,'১','লিটার','2026-07-21 08:24:55','2026-07-21 08:24:52','Active Lavender Sports Bottle 1L','অ্যাক্টিভ ল্যাভেন্ডার স্পোর্টস বোতল ১ লিটার','A lightweight sports bottle with a lockable flip lid and carry handle.','লকযোগ্য ফ্লিপ লিড ও ক্যারি হ্যান্ডেলসহ হালকা স্পোর্টস বোতল।','A roomy everyday hydration bottle featuring an easy one-touch flip lid, safety lock, comfortable grip and integrated handle.','ওয়ান-টাচ ফ্লিপ লিড, সেফটি লক, আরামদায়ক গ্রিপ ও বিল্ট-ইন হ্যান্ডেলসহ প্রশস্ত দৈনন্দিন পানির বোতল।','1','১','liter','লিটার'),('c3000000-0000-4000-8000-000000000005','ইকো টিল ভ্যাকুয়াম ফ্লাস্ক ৫০০ মি.লি.','eco-teal-vacuum-flask-500ml','ইনসুলেটেড স্টিল বডি, লিক-রেজিস্ট্যান্ট ব্যাম্বু-ফিনিশ ক্যাপ ও সহজে বহনযোগ্য মেটাল লুপসহ স্টাইলিশ কমপ্যাক্ট ফ্লাস্ক।','ব্যাম্বু-ফিনিশ ক্যাপ ও মেটাল লুপসহ কমপ্যাক্ট টিল ভ্যাকুয়াম ফ্লাস্ক।',850.00,690.00,469.00,'FM-WB-004',24,'d487b6b4-e5cf-42ee-816b-bc79e2c34eca',NULL,'/assets/uploads/product-images/catalog-20260719/eco-teal-vacuum-flask-500ml.png','[]',1,0,'৫০০','মি.লি.','2026-07-21 08:24:56','2026-07-21 08:24:52','Eco Teal Vacuum Flask 500ml','ইকো টিল ভ্যাকুয়াম ফ্লাস্ক ৫০০ মি.লি.','A compact teal vacuum flask with a bamboo-finish cap and metal loop.','ব্যাম্বু-ফিনিশ ক্যাপ ও মেটাল লুপসহ কমপ্যাক্ট টিল ভ্যাকুয়াম ফ্লাস্ক।','A stylish compact vacuum flask with an insulated steel body, leak-resistant bamboo-finish cap and easy-carry metal loop.','ইনসুলেটেড স্টিল বডি, লিক-রেজিস্ট্যান্ট ব্যাম্বু-ফিনিশ ক্যাপ ও সহজে বহনযোগ্য মেটাল লুপসহ স্টাইলিশ কমপ্যাক্ট ফ্লাস্ক।','500','৫০০','ml','মি.লি.'),('ce192516-5353-4d2b-b691-d7e9de019f1e','ভিটামিন সি ১০০০ মিগ্রা ট্যাবলেট','vitamin-c-1000mg-tablets','ভিটামিন সি ১০০০ মিগ্রা ট্যাবলেট। স্পষ্ট লেবেলযুক্ত মানসম্মত হেলথ সাপ্লিমেন্ট। প্যাকের নির্দেশনা অনুসরণ করুন অথবা চিকিৎসকের পরামর্শ নিন।','স্পষ্ট লেবেলযুক্ত মানসম্মত হেলথ সাপ্লিমেন্ট। প্যাকের নির্দেশনা অনুসরণ করুন অথবা চিকিৎসকের পরামর্শ নিন।',850.00,750.00,NULL,NULL,50,'2a73b178-e0b0-4173-8c1a-a40e3cacb7f3',NULL,'/backend/storage/uploads/product-images/NbichA1EAFMAv0GdsgDwKfavruMuGeSZ99ZVKz0E.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 02:07:35','Vitamin C 1000mg Tablets','ভিটামিন সি ১০০০ মিগ্রা ট্যাবলেট','Quality health supplement with clear labelling. Please follow the dosage on the pack or consult a doctor.','স্পষ্ট লেবেলযুক্ত মানসম্মত হেলথ সাপ্লিমেন্ট। প্যাকের নির্দেশনা অনুসরণ করুন অথবা চিকিৎসকের পরামর্শ নিন।','Vitamin C 1000mg Tablets. Quality health supplement with clear labelling. Please follow the dosage on the pack or consult a doctor.','ভিটামিন সি ১০০০ মিগ্রা ট্যাবলেট। স্পষ্ট লেবেলযুক্ত মানসম্মত হেলথ সাপ্লিমেন্ট। প্যাকের নির্দেশনা অনুসরণ করুন অথবা চিকিৎসকের পরামর্শ নিন।',NULL,NULL,NULL,NULL),('dd475e6c-73c4-47e1-a420-3303a693d61d','ভেলক্রো স্ট্র্যাপ টডলার শু (Copy)','velcro-strap-toddler-shoes-copy-1785309786504','ভেলক্রো স্ট্র্যাপ টডলার শু। নরম সোল ও অ্যান্টি-স্লিপ গ্রিপের বেবি শু — ছোট্ট পায়ে হালকা এবং সহজে পরানো যায়।','নরম সোল ও অ্যান্টি-স্লিপ গ্রিপের বেবি শু — ছোট্ট পায়ে হালকা এবং সহজে পরানো যায়।',890.00,790.00,NULL,NULL,40,'960fedc6-4b96-42f2-94a4-796e03f5fa0f',NULL,'/backend/storage/uploads/product-images/UwDZh2oYRyfQGqIMhN3x6SVlCQVjJfDIdzsCNti7.webp','[]',1,0,NULL,NULL,'2026-07-29 01:23:06','2026-07-29 01:23:06','Velcro Strap Toddler Shoes','ভেলক্রো স্ট্র্যাপ টডলার শু','Soft-sole baby shoes with anti-slip grip — light on tiny feet and easy to put on.','নরম সোল ও অ্যান্টি-স্লিপ গ্রিপের বেবি শু — ছোট্ট পায়ে হালকা এবং সহজে পরানো যায়।','Velcro Strap Toddler Shoes. Soft-sole baby shoes with anti-slip grip — light on tiny feet and easy to put on.','ভেলক্রো স্ট্র্যাপ টডলার শু। নরম সোল ও অ্যান্টি-স্লিপ গ্রিপের বেবি শু — ছোট্ট পায়ে হালকা এবং সহজে পরানো যায়।',NULL,NULL,NULL,NULL),('e2846616-d12d-499e-b0e1-b48d2ac9eca7','অলিভ গ্রিন ক্রু নেক টি-শার্ট','olive-green-crew-neck-t-shirt-1784643893-4','ক্রু নেক ডিজাইন সহ স্টাইলিশ অলিভ গ্রিন টি-শার্ট। আরামদায়ক এবং টেকসই।',NULL,700.00,480.00,NULL,NULL,48,'230d95a7-68a6-4aba-a991-6115107cc1fe',NULL,'/backend/storage/uploads/product-images/iZ4UjDrKHZ3su3sXSgayYFCyhNF1rVYy1ToFMSKu.webp','[]',1,0,NULL,NULL,'2026-07-21 08:24:53','2026-07-29 00:40:42','Olive Green Crew Neck T-Shirt','অলিভ গ্রিন ক্রু নেক টি-শার্ট',NULL,NULL,'Stylish olive green t-shirt with crew neck design. Comfortable and durable.','ক্রু নেক ডিজাইন সহ স্টাইলিশ অলিভ গ্রিন টি-শার্ট। আরামদায়ক এবং টেকসই।',NULL,NULL,NULL,NULL),('ed9a01a4-bbf2-40fa-ad84-08d8f12985b8','ফলো দ্য সুন্নাহ লং স্লিভ টি-শার্ট','follow-the-sunnah-long-sleeve-t-shirt-1784643893-5','\"ফলো দ্য সুন্নাহ\" প্রিন্ট সহ ইসলামিক থিমের লং স্লিভ টি-শার্ট। প্রিমিয়াম মানের কটন।',NULL,850.00,650.00,NULL,NULL,49,'230d95a7-68a6-4aba-a991-6115107cc1fe',NULL,'/backend/storage/uploads/product-images/lj0pMzLayiDjgQN9tgvLVwYJAfl1yS23ZW9VFAYb.webp','[]',1,0,NULL,NULL,'2026-07-21 08:24:53','2026-07-26 01:11:46','Follow The Sunnah Long Sleeve T-Shirt','ফলো দ্য সুন্নাহ লং স্লিভ টি-শার্ট',NULL,NULL,'Islamic themed long sleeve t-shirt with \"Follow The Sunnah\" print. Premium quality cotton.','\"ফলো দ্য সুন্নাহ\" প্রিন্ট সহ ইসলামিক থিমের লং স্লিভ টি-শার্ট। প্রিমিয়াম মানের কটন।',NULL,NULL,NULL,NULL),('efef56de-979a-43b1-aa8c-4cda1b0b4db0','হুই প্রোটিন পাউডার ১ কেজি','whey-protein-powder-1kg','হুই প্রোটিন পাউডার ১ কেজি। স্পষ্ট লেবেলযুক্ত মানসম্মত হেলথ সাপ্লিমেন্ট। প্যাকের নির্দেশনা অনুসরণ করুন অথবা চিকিৎসকের পরামর্শ নিন।','স্পষ্ট লেবেলযুক্ত মানসম্মত হেলথ সাপ্লিমেন্ট। প্যাকের নির্দেশনা অনুসরণ করুন অথবা চিকিৎসকের পরামর্শ নিন।',3450.00,3150.00,NULL,NULL,20,'2a73b178-e0b0-4173-8c1a-a40e3cacb7f3',NULL,'/backend/storage/uploads/product-images/PFRuzXgVIEo3RiyIF7TwkFNv9Y0WywhzLY1vZBX9.webp','[]',1,0,NULL,NULL,'2026-07-29 01:06:16','2026-07-29 02:06:52','Whey Protein Powder 1kg','হুই প্রোটিন পাউডার ১ কেজি','Quality health supplement with clear labelling. Please follow the dosage on the pack or consult a doctor.','স্পষ্ট লেবেলযুক্ত মানসম্মত হেলথ সাপ্লিমেন্ট। প্যাকের নির্দেশনা অনুসরণ করুন অথবা চিকিৎসকের পরামর্শ নিন।','Whey Protein Powder 1kg. Quality health supplement with clear labelling. Please follow the dosage on the pack or consult a doctor.','হুই প্রোটিন পাউডার ১ কেজি। স্পষ্ট লেবেলযুক্ত মানসম্মত হেলথ সাপ্লিমেন্ট। প্যাকের নির্দেশনা অনুসরণ করুন অথবা চিকিৎসকের পরামর্শ নিন।',NULL,NULL,NULL,NULL),('f09c835d-850f-11f1-ba38-28d0eaec4da6','প্রিমিয়াম কটন লুঙ্গি নীল ডোরা','premium-cotton-lungi-blue-stripes','সুন্দর নীল এবং কালো ডোরাকাটা প্যাটার্ন সহ উচ্চ মানের কটন লুঙ্গি। দৈনন্দিন পরিধানের জন্য আরামদায়ক এবং শ্বাসপ্রশ্বাসযোগ্য ফ্যাব্রিক।',NULL,450.00,NULL,NULL,NULL,50,'757917d5-06fc-4977-9b08-f5d1a551d758',NULL,'/backend/storage/uploads/product-images/C4tLkA0p7CVIea2kUu6Xqk9PPhunKjeSjQiFM5RM.webp','[]',1,0,NULL,NULL,'2026-07-21 08:24:53','2026-07-26 01:12:05','Premium Cotton Lungi Blue Stripes','প্রিমিয়াম কটন লুঙ্গি নীল ডোরা',NULL,NULL,'High quality cotton lungi with beautiful blue and black striped pattern. Comfortable and breathable fabric perfect for daily wear.','সুন্দর নীল এবং কালো ডোরাকাটা প্যাটার্ন সহ উচ্চ মানের কটন লুঙ্গি। দৈনন্দিন পরিধানের জন্য আরামদায়ক এবং শ্বাসপ্রশ্বাসযোগ্য ফ্যাব্রিক।',NULL,NULL,NULL,NULL),('f09cfccd-850f-11f1-ba38-28d0eaec4da6','ট্র্যাডিশনাল লুঙ্গি বাদামী নীল চেক','traditional-lungi-brown-blue-check','বাদামী এবং নীল প্যাটার্ন সহ ক্লাসিক চেক লুঙ্গি। সর্বাধিক আরামের জন্য প্রিমিয়াম মানের কটন থেকে তৈরি।',NULL,480.00,NULL,NULL,NULL,40,'757917d5-06fc-4977-9b08-f5d1a551d758',NULL,'/backend/storage/uploads/product-images/mio8Yr2NiMKNeBCpV4UA8yRm4HB6pwN1JaPcsYSm.webp','[]',1,0,NULL,NULL,'2026-07-21 08:24:53','2026-07-26 01:12:25','Traditional Lungi Brown Blue Check','ট্র্যাডিশনাল লুঙ্গি বাদামী নীল চেক',NULL,NULL,'Classic checked lungi with brown and blue pattern. Made from premium quality cotton for maximum comfort.','বাদামী এবং নীল প্যাটার্ন সহ ক্লাসিক চেক লুঙ্গি। সর্বাধিক আরামের জন্য প্রিমিয়াম মানের কটন থেকে তৈরি।',NULL,NULL,NULL,NULL),('f09d66a7-850f-11f1-ba38-28d0eaec4da6','নরম কটন লুঙ্গি হালকা বাদামী নীল','soft-cotton-lungi-light-brown-blue','মার্জিত হালকা বাদামী এবং নীল চেক লুঙ্গি। নরম ফ্যাব্রিক সারাদিন আরাম নিশ্চিত করে।',NULL,420.00,NULL,NULL,NULL,45,'757917d5-06fc-4977-9b08-f5d1a551d758',NULL,'/backend/storage/uploads/product-images/sh5QPCJqvFSBj16KfQ0e8S2QLvivdrZcrn9o6jgE.webp','[]',1,0,NULL,NULL,'2026-07-21 08:24:53','2026-07-26 01:12:51','Soft Cotton Lungi Light Brown Blue','নরম কটন লুঙ্গি হালকা বাদামী নীল',NULL,NULL,'Elegant light brown and blue checked lungi. Soft fabric ensures all-day comfort.','মার্জিত হালকা বাদামী এবং নীল চেক লুঙ্গি। নরম ফ্যাব্রিক সারাদিন আরাম নিশ্চিত করে।',NULL,NULL,NULL,NULL),('f09de684-850f-11f1-ba38-28d0eaec4da6','সবুজ সাদা চেক লুঙ্গি','green-white-check-lungi','তাজা সবুজ এবং সাদা চেক প্যাটার্ন লুঙ্গি। নৈমিত্তিক এবং আনুষ্ঠানিক অনুষ্ঠানের জন্য নিখুঁত।',NULL,490.00,NULL,NULL,NULL,35,'757917d5-06fc-4977-9b08-f5d1a551d758',NULL,'/backend/storage/uploads/product-images/8abXPrm72xJN3y2fQMM6BqKpAPhBI9Ithl68yA0C.webp','[]',1,0,NULL,NULL,'2026-07-21 08:24:53','2026-07-26 01:10:43','Green White Check Lungi','সবুজ সাদা চেক লুঙ্গি',NULL,NULL,'Fresh green and white checked pattern lungi. Perfect for casual and formal occasions.','তাজা সবুজ এবং সাদা চেক প্যাটার্ন লুঙ্গি। নৈমিত্তিক এবং আনুষ্ঠানিক অনুষ্ঠানের জন্য নিখুঁত।',NULL,NULL,NULL,NULL),('f09e60f0-850f-11f1-ba38-28d0eaec4da6','বহুরঙা কটন লুঙ্গি','multicolor-cotton-lungi','নীল, বাদামী এবং সাদা প্যাটার্ন সহ প্রাণবন্ত বহুরঙা লুঙ্গি। স্টাইলিশ এবং আরামদায়ক।',NULL,520.00,NULL,NULL,NULL,30,'757917d5-06fc-4977-9b08-f5d1a551d758',NULL,'/backend/storage/uploads/product-images/AUq4boPsAGPrIcvkyoRqNDHzsEmLaofvoEspWaVY.webp','[]',1,0,NULL,NULL,'2026-07-21 08:24:53','2026-07-26 01:13:16','Multicolor Cotton Lungi','বহুরঙা কটন লুঙ্গি',NULL,NULL,'Vibrant multicolor lungi with blue, brown and white pattern. Stylish and comfortable.','নীল, বাদামী এবং সাদা প্যাটার্ন সহ প্রাণবন্ত বহুরঙা লুঙ্গি। স্টাইলিশ এবং আরামদায়ক।',NULL,NULL,NULL,NULL),('f09ed98e-850f-11f1-ba38-28d0eaec4da6','রঙিন চেক লুঙ্গি ফিরোজা গোলাপী','colorful-check-lungi-turquoise-pink','অনন্য ফিরোজা, গোলাপী এবং নীল চেক লুঙ্গি। এই স্বতন্ত্র ডিজাইনের সাথে আলাদা হয়ে উঠুন।',NULL,550.00,NULL,NULL,NULL,25,'757917d5-06fc-4977-9b08-f5d1a551d758',NULL,'/backend/storage/uploads/product-images/bRwq0tdeX7MBhmECruAv8ciwwf9OtETnbyMMDgc9.webp','[]',1,0,NULL,NULL,'2026-07-21 08:24:53','2026-07-26 01:13:42','Colorful Check Lungi Turquoise Pink','রঙিন চেক লুঙ্গি ফিরোজা গোলাপী',NULL,NULL,'Unique turquoise, pink and blue checked lungi. Stand out with this distinctive design.','অনন্য ফিরোজা, গোলাপী এবং নীল চেক লুঙ্গি। এই স্বতন্ত্র ডিজাইনের সাথে আলাদা হয়ে উঠুন।',NULL,NULL,NULL,NULL),('f09f570e-850f-11f1-ba38-28d0eaec4da6','বেগুনি নীল প্লেইড লুঙ্গি','purple-blue-plaid-lungi','মার্জিত বেগুনি এবং নীল প্লেইড প্যাটার্ন লুঙ্গি। প্রিমিয়াম মানের কটন ফ্যাব্রিক।',NULL,510.00,NULL,NULL,NULL,40,'757917d5-06fc-4977-9b08-f5d1a551d758',NULL,'/backend/storage/uploads/product-images/ftEU8uMbHKVE62zpVi6jlcK8FqDAFBoy7GKjqzLB.webp','[]',1,0,NULL,NULL,'2026-07-21 08:24:53','2026-07-26 01:14:06','Purple Blue Plaid Lungi','বেগুনি নীল প্লেইড লুঙ্গি',NULL,NULL,'Elegant purple and blue plaid pattern lungi. Premium quality cotton fabric.','মার্জিত বেগুনি এবং নীল প্লেইড প্যাটার্ন লুঙ্গি। প্রিমিয়াম মানের কটন ফ্যাব্রিক।',NULL,NULL,NULL,NULL),('f0a049dd-850f-11f1-ba38-28d0eaec4da6','মিক্সড ব্লু চেক লুঙ্গি প্রিমিয়াম','mixed-blue-check-lungi-premium','মিশ্র নীল, কালো এবং সাদা চেক সহ প্রিমিয়াম মানের লুঙ্গি। টেকসই এবং স্টাইলিশ।',NULL,580.00,NULL,NULL,NULL,35,'757917d5-06fc-4977-9b08-f5d1a551d758',NULL,'/backend/storage/uploads/product-images/ZUCvyku5drbdu3dYJg2AEMHznm3eB3JbMyfRfeUF.webp','[]',1,0,NULL,NULL,'2026-07-21 08:24:53','2026-07-26 01:14:32','Mixed Blue Check Lungi Premium','মিক্সড ব্লু চেক লুঙ্গি প্রিমিয়াম',NULL,NULL,'Premium quality lungi with mixed blue, black and white checks. Durable and stylish.','মিশ্র নীল, কালো এবং সাদা চেক সহ প্রিমিয়াম মানের লুঙ্গি। টেকসই এবং স্টাইলিশ।',NULL,NULL,NULL,NULL),('f0a23e2e-850f-11f1-ba38-28d0eaec4da6','ভাইব্রান্ট ব্লু চেক স্লিম ফিট শার্ট','vibrant-blue-check-slim-fit-shirt','স্লিম ফিট ডিজাইন সহ প্রিমিয়াম মানের নীল চেক প্যাটার্ন শার্ট। ভাইব্রান্ট দ্বারা বাংলাদেশে তৈরি। অফিস এবং আনুষ্ঠানিক অনুষ্ঠানের জন্য নিখুঁত।',NULL,1250.00,NULL,NULL,NULL,45,'6b143829-dc22-4eaa-948b-00d202b700d0',NULL,'/backend/storage/uploads/product-images/yRxJRHegVfDR2U09MFJ4wBPxDHOwbN5dLv34HBYw.webp','[]',1,0,NULL,NULL,'2026-07-21 08:24:53','2026-07-26 01:17:01','Vibrant Blue Check Slim Fit Shirt','ভাইব্রান্ট ব্লু চেক স্লিম ফিট শার্ট',NULL,NULL,'Premium quality blue check pattern shirt with slim fit design. Made in Bangladesh by Vibrant. Perfect for office and formal occasions.','স্লিম ফিট ডিজাইন সহ প্রিমিয়াম মানের নীল চেক প্যাটার্ন শার্ট। ভাইব্রান্ট দ্বারা বাংলাদেশে তৈরি। অফিস এবং আনুষ্ঠানিক অনুষ্ঠানের জন্য নিখুঁত।',NULL,NULL,NULL,NULL),('f0a3884a-850f-11f1-ba38-28d0eaec4da6','ভাইব্রান্ট বেইজ স্ট্রাইপড স্লিম ফিট শার্ট','vibrant-beige-striped-slim-fit-shirt','বাটন-ডাউন কলার সহ ক্লাসিক বেইজ ডোরাকাটা শার্ট। অফিস পরিধানের জন্য আরামদায়ক এবং পেশাদার চেহারা।',NULL,1220.00,NULL,NULL,NULL,50,'6b143829-dc22-4eaa-948b-00d202b700d0',NULL,'/backend/storage/uploads/product-images/CvObRmFWSTCVrLzyrTiVAkHVXA3RHylTwN8CuDoc.webp','[]',1,0,NULL,NULL,'2026-07-21 08:24:53','2026-07-26 01:17:19','Vibrant Beige Striped Slim Fit Shirt','ভাইব্রান্ট বেইজ স্ট্রাইপড স্লিম ফিট শার্ট',NULL,NULL,'Classic beige striped shirt with button-down collar. Comfortable and professional look for office wear.','বাটন-ডাউন কলার সহ ক্লাসিক বেইজ ডোরাকাটা শার্ট। অফিস পরিধানের জন্য আরামদায়ক এবং পেশাদার চেহারা।',NULL,NULL,NULL,NULL),('f0a3ecf0-850f-11f1-ba38-28d0eaec4da6','ভাইব্রান্ট ইয়েলো স্ট্রাইপড স্লিম ফিট শার্ট','vibrant-yellow-striped-slim-fit-shirt','বাটন-ডাউন কলার সহ উজ্জ্বল হলুদ এবং সাদা ডোরাকাটা শার্ট। আপনার পোশাকে রঙের ছোঁয়া যোগ করে।',NULL,1240.00,NULL,NULL,NULL,42,'6b143829-dc22-4eaa-948b-00d202b700d0',NULL,'/backend/storage/uploads/product-images/iB6UdLNAGq5c98zGlDYK68KZBEke3NZsrj2n0LWF.webp','[]',1,0,NULL,NULL,'2026-07-21 08:24:53','2026-07-26 01:17:40','Vibrant Yellow Striped Slim Fit Shirt','ভাইব্রান্ট ইয়েলো স্ট্রাইপড স্লিম ফিট শার্ট',NULL,NULL,'Bright yellow and white striped shirt with button-down collar. Adds a pop of color to your wardrobe.','বাটন-ডাউন কলার সহ উজ্জ্বল হলুদ এবং সাদা ডোরাকাটা শার্ট। আপনার পোশাকে রঙের ছোঁয়া যোগ করে।',NULL,NULL,NULL,NULL),('f0a44a6a-850f-11f1-ba38-28d0eaec4da6','ভাইব্রান্ট লাইট ব্লু স্ট্রাইপড শার্ট','vibrant-light-blue-striped-shirt','সতেজ হালকা নীল এবং সাদা ডোরাকাটা ফরমাল শার্ট। ব্যবসায়িক মিটিং এবং পেশাদার সেটিংসের জন্য নিখুঁত।',NULL,1200.00,NULL,NULL,NULL,48,'6b143829-dc22-4eaa-948b-00d202b700d0',NULL,'/backend/storage/uploads/product-images/JSOUbbHd9E28s1cBsgcv6tIk5zESA7WrZkvur5ts.webp','[]',1,0,NULL,NULL,'2026-07-21 08:24:53','2026-07-26 01:18:03','Vibrant Light Blue Striped Shirt','ভাইব্রান্ট লাইট ব্লু স্ট্রাইপড শার্ট',NULL,NULL,'Refreshing light blue and white striped formal shirt. Perfect for business meetings and professional settings.','সতেজ হালকা নীল এবং সাদা ডোরাকাটা ফরমাল শার্ট। ব্যবসায়িক মিটিং এবং পেশাদার সেটিংসের জন্য নিখুঁত।',NULL,NULL,NULL,NULL),('f0a4a670-850f-11f1-ba38-28d0eaec4da6','ভাইব্রান্ট টিল ডটেড স্লিম ফিট শার্ট','vibrant-teal-dotted-slim-fit-shirt','সূক্ষ্ম ডট প্যাটার্ন সহ স্টাইলিশ টিল শার্ট। আধুনিক এবং পরিশীলিত চেহারার জন্য স্লিম ফিট ডিজাইন।',NULL,1290.00,NULL,NULL,NULL,38,'6b143829-dc22-4eaa-948b-00d202b700d0',NULL,'/backend/storage/uploads/product-images/Vu4FiO1Utewu69SoodeJqJTtzk8VaSe5gy0bUCVN.webp','[]',1,0,NULL,NULL,'2026-07-21 08:24:53','2026-07-26 01:18:36','Vibrant Teal Dotted Slim Fit Shirt','ভাইব্রান্ট টিল ডটেড স্লিম ফিট শার্ট',NULL,NULL,'Stylish teal shirt with subtle dot pattern. Slim fit design for a modern and sophisticated look.','সূক্ষ্ম ডট প্যাটার্ন সহ স্টাইলিশ টিল শার্ট। আধুনিক এবং পরিশীলিত চেহারার জন্য স্লিম ফিট ডিজাইন।',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `profiles` (
  `id` char(36) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `full_name` text DEFAULT NULL,
  `phone` text DEFAULT NULL,
  `email` text DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `profiles_user_id_unique` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `profiles` WRITE;
/*!40000 ALTER TABLE `profiles` DISABLE KEYS */;
/*!40000 ALTER TABLE `profiles` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reviews` (
  `id` char(36) NOT NULL,
  `product_id` char(36) DEFAULT NULL,
  `customer_name` text NOT NULL,
  `avatar_url` text DEFAULT NULL,
  `rating` tinyint(3) unsigned NOT NULL DEFAULT 5,
  `review_text` text NOT NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT 0,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reviews_product_id_index` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES ('411ea407-6f6d-414d-8cc3-e002d25cf086',NULL,'রহিমা আক্তার','https://i.pravatar.cc/150?img=47',5,'ক্লাসিক ব্রাউন মনোগ্রাম হ্যান্ডব্যাগটা ছবিতে যেমন দেখেছি, হাতে পেয়ে ঠিক তেমনই। ফিনিশিং আর প্যাকেজিং দুটোই দারুণ। ধন্যবাদ ড্রিম মার্ট!',1,1,1,'2026-07-21 08:24:51','2026-07-21 08:24:51'),('4579094d-5a37-49d7-86c0-13a12b8dcbbf',NULL,'সাবিনা ইয়াসমিন','https://i.pravatar.cc/150?img=44',4,'বেবি গার্ল ফ্রক আর কার্টুন প্রিন্ট বেবি স্যান্ডেল দুটোই ফ্রেশ পেয়েছি। বাচ্চারা খুব পছন্দ করেছে। ধন্যবাদ ড্রিম মার্ট!',1,1,6,'2026-07-21 08:24:51','2026-07-21 08:24:51'),('553e2661-05db-4df3-a9fe-cdaa45d6f9f4',NULL,'করিম উদ্দিন','https://i.pravatar.cc/150?img=57',5,'প্রিমিয়াম কটন লুঙ্গির কাপড় খুবই আরামদায়ক, রঙও নষ্ট হয়নি। নিয়মিত ব্যবহার করছি, আবার অর্ডার করবো ইনশাআল্লাহ।',1,1,5,'2026-07-21 08:24:51','2026-07-21 08:24:51'),('8529c0fa-8595-4749-b320-a4768d8300f0',NULL,'তানভীর হাসান','https://i.pravatar.cc/150?img=15',5,'ওয়্যারলেস ব্লুটুথ ইয়ারবাডস ২৪ ঘন্টার মধ্যে ডেলিভারি পেয়েছি। সাউন্ড কোয়ালিটি আর ব্যাটারি ব্যাকআপ দুটোই দারুণ। ড্রিম মার্ট-কে ধন্যবাদ।',1,1,3,'2026-07-21 08:24:51','2026-07-21 08:24:51'),('93417ca3-bce2-4ecf-b54d-0be57273bab0',NULL,'আব্দুল মালেক','https://i.pravatar.cc/150?img=12',5,'গোল্ডেন স্কেলিটন ডায়াল ঘড়িটা একদম অরিজিনাল, দাম অনুযায়ী কোয়ালিটি অসাধারণ। সবাই জিজ্ঞেস করে কোথা থেকে নিলাম।',1,1,2,'2026-07-21 08:24:51','2026-07-21 08:24:51'),('9b14766c-1da6-4051-bb2f-9197dbedef9a',NULL,'ফাতেমা বেগম','https://i.pravatar.cc/150?img=49',5,'অনেক দিন ধরে ভালো কটন এমব্রয়ডারি সালোয়ার কামিজ খুঁজছিলাম, অবশেষে ড্রিম মার্ট-এ পেলাম! কাপড় আর সেলাইয়ের কাজ একদম নিখুঁত।',1,1,4,'2026-07-21 08:24:51','2026-07-21 08:24:51'),('a25c7976-e98d-446f-b268-230a8d43a691',NULL,'নাসরিন সুলতানা','https://i.pravatar.cc/150?img=45',5,'রোজ ভেলভেট পারফিউমের ঘ্রাণ অনেকক্ষণ থাকে, একদম অরিজিনাল প্রোডাক্ট। বারবার কিনব ড্রিম মার্ট থেকে।',1,1,8,'2026-07-21 08:24:51','2026-07-21 08:24:51'),('eedcdc43-1108-425e-9c2e-ecf8bf50e828',NULL,'মোঃ রাসেল মিয়া','https://i.pravatar.cc/150?img=59',5,'১০০০০ এমএএইচ পাওয়ার ব্যাংক আর স্মার্ট ওয়াচ দুটোই সম্পূর্ণ অরিজিনাল, কোনো ঝামেলা নেই। পরিবারের সবাই পছন্দ করেছে।',1,1,7,'2026-07-21 08:24:51','2026-07-21 08:24:51');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `shipping_charges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shipping_charges` (
  `id` char(36) NOT NULL,
  `area_name` text NOT NULL,
  `charge` decimal(10,2) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `area_name_en` text DEFAULT NULL,
  `area_name_bn` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `shipping_charges_active_idx` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `shipping_charges` WRITE;
/*!40000 ALTER TABLE `shipping_charges` DISABLE KEYS */;
INSERT INTO `shipping_charges` VALUES ('2dcaea5f-3334-4310-8c97-c597d1ec2081','ঢাকার ভিতরে',70.00,1,'2026-07-21 08:55:15','2026-07-21 08:55:15',NULL,NULL),('c2a4bc78-b863-4c6b-89fb-e970a0c4f49e','ঢাকার বাইরে',150.00,1,'2026-07-21 08:55:15','2026-07-21 08:55:15',NULL,NULL);
/*!40000 ALTER TABLE `shipping_charges` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `site_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `site_settings` (
  `id` char(36) NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  `group_name` varchar(255) NOT NULL DEFAULT 'general',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_settings_key_unique` (`key`),
  KEY `site_settings_group_idx` (`group_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
INSERT INTO `site_settings` VALUES ('02480778-dd0b-4079-b41b-2a778aae32bf','payment_bkash_enabled',NULL,'payment','2026-07-26 02:18:49','2026-07-26 02:20:00'),('0e6b4cef-8aca-4214-bb75-eb01a80bd4de','google_tag_manager','','pixels','2026-07-21 08:55:15','2026-07-21 08:55:15'),('1708850d-8823-446b-a354-84f4731e2101','payment_nagad_type',NULL,'payment','2026-07-26 02:18:51','2026-07-26 02:20:02'),('1a2c05e1-4e12-482b-9dfc-767bc0f088a3','accent_color','#036CC7','branding','2026-07-21 08:55:15','2026-07-29 08:01:35'),('1a651186-1e0e-479b-b8a5-5d93226c9451','payment_cod_enabled',NULL,'payment','2026-07-26 02:18:49','2026-07-26 02:19:59'),('1e71fe47-b065-485f-a130-e643a6c12138','google_ads_conversion_label','','tracking','2026-07-21 08:24:50','2026-07-21 08:24:50'),('1f536a12-ffa5-4e4f-a15f-2aa7e2f8ce94','brand_logo','/backend/storage/uploads/site-settings/3cnV5UQYPYJlCyQ4aDF1uxHGeShfplbHkFD93P3O.webp','branding','2026-07-21 08:55:15','2026-07-28 04:44:32'),('2818d490-9eb8-41a7-ba93-b9e469edfa25','openai_api_key','','features','2026-07-21 08:24:51','2026-07-21 08:24:51'),('2a81f16a-2e04-42e7-8b96-00ede4cac203','payment_nagad_number',NULL,'payment','2026-07-26 02:18:50','2026-07-26 02:20:02'),('33816c16-f84e-43bc-bb6c-e0fc97f423d9','payment_bkash_logo','/backend/storage/uploads/site-settings/9WEE1G0NHKUgVnw01WHgnzTouLPlgzhaHHk0NKbC.webp','payment','2026-07-26 02:18:50','2026-07-26 02:20:01'),('38280de9-924b-4ac5-ac88-aea096290a1c','site_logo','','general','2026-07-21 08:55:15','2026-07-21 08:55:15'),('41e6bf1a-5937-4752-8057-432d50dbd2f8','brand_name_bn','ড্রিম মার্ট','general','2026-07-28 04:25:45','2026-07-28 04:25:45'),('47a79e18-cfbe-4d12-89c1-585bccb47996','social_facebook','','footer','2026-07-21 08:55:15','2026-07-21 08:55:15'),('4bbc1dd4-2ba0-4f03-bfea-514f4f97a563','payment_nagad_logo','/backend/storage/uploads/site-settings/De61Dlq1aP34SASaktVj8Az0ixmLvGkaSwYGcwPQ.webp','payment','2026-07-26 02:18:51','2026-07-26 02:20:03'),('4c3cc01b-29d6-4398-a990-41ffcce31bc4','payment_nagad_enabled',NULL,'payment','2026-07-26 02:18:50','2026-07-26 02:20:02'),('5116728d-cdce-440c-81be-285ced3a5b84','show_flashsale_section','true','homepage','2026-07-21 08:55:15','2026-07-21 08:55:15'),('57b84dee-03fd-42b3-aed7-8f720dcc75ba','show_trending_section','true','homepage','2026-07-21 08:55:15','2026-07-21 08:55:15'),('584b6179-fc7c-43f2-bc81-0761a535141c','facebook_pixel','','pixels','2026-07-21 08:55:15','2026-07-21 08:55:15'),('5ee931f5-3aa8-475d-92c6-65bab6ad5d02','site_email','','general','2026-07-21 08:55:15','2026-07-21 08:55:15'),('60ce5e3b-27a2-403a-9ffa-6cacfc641210','social_instagram','','footer','2026-07-21 08:55:15','2026-07-21 08:55:15'),('677809b9-3e7d-4166-82f6-9f46b74d4ea3','site_address','Dhaka , Bangladesh','general','2026-07-21 08:55:15','2026-07-28 05:09:57'),('6928016a-dede-4737-b6fd-0d81386f76d1','checkout_hotline',NULL,'general','2026-07-28 05:01:34','2026-07-28 05:01:34'),('705be1ab-17dc-4bc1-873b-32e014899f5b','brand_name_en','Dream Mart','general','2026-07-28 04:25:45','2026-07-28 04:40:56'),('79553730-3b2a-48c9-b74a-b52f5cc765ef','seo_og_image','','seo','2026-07-21 08:55:15','2026-07-21 08:55:15'),('7c45a0fa-c25e-4708-872c-17790a034a2b','copyright_text','© 2026 Dream Mart. All rights reserved.','footer','2026-07-21 08:55:15','2026-07-21 08:55:15'),('7d15be3b-7e2f-4ded-b521-269c683e29b2','site_address_en','Address-House-26,Road-2,Adabor,Dhaka-1207.','general','2026-07-28 05:09:57','2026-07-28 05:09:57'),('7e1f0cc6-e031-4117-b35b-7e4c2addcb14','footer_important_links','[{\"label\":\"অর্ডার ট্র্যাক\",\"url\":\"/track-order\"},{\"label\":\"লগইন\",\"url\":\"/login\"},{\"label\":\"কার্ট\",\"url\":\"/cart\"}]','footer','2026-07-21 08:55:15','2026-07-21 08:55:15'),('7fefca93-6152-4fa4-a83c-ceba815e15f3','button_color','#036CC7','branding','2026-07-21 08:55:15','2026-07-21 08:55:15'),('80d52c83-129b-4d5e-a3c4-5d5f5e5e5857','show_category_section','true','homepage','2026-07-21 08:55:15','2026-07-21 08:55:15'),('827a1d6a-35a7-42da-81c6-00ec9d72a772','seo_description','Dream Mart - Your favourite online shop','seo','2026-07-21 08:55:15','2026-07-21 08:55:15'),('832b9588-6454-400d-89c4-f38d289518e4','show_offer_section','true','homepage','2026-07-21 08:55:15','2026-07-21 08:55:15'),('8586e795-ee9d-4534-876c-1d37e3f28071','brand_name','Dream Mart','branding','2026-07-21 08:55:15','2026-07-28 04:25:46'),('87959b70-b591-4aa5-a159-af2aa91e3805','live_chat_enabled','true','features','2026-07-21 08:24:51','2026-07-21 08:24:51'),('880e83a7-eb47-4768-be9c-d6a724d79c36','social_youtube','','footer','2026-07-21 08:55:15','2026-07-21 08:55:15'),('898dc390-2c75-49e1-9f85-9c461ded225c','whatsapp_template','01680310063','contact','2026-07-21 08:55:15','2026-07-28 05:01:35'),('8ca91062-df2f-46a6-ad37-9efbaa4964df','footer_category_links','[{\"label\":\"সুপার ফুডস\",\"url\":\"/category/super-foods\"},{\"label\":\"অর্গানিক মধু\",\"url\":\"/category/organic-honey\"},{\"label\":\"মিষ্টি ও দুগ্ধ\",\"url\":\"/category/sweeteners-dairy\"},{\"label\":\"অর্গানিক মশলা\",\"url\":\"/category/organic-spices\"}]','footer','2026-07-21 08:55:15','2026-07-21 08:55:15'),('8f385134-c373-4cff-852d-99e56be12348','footer_cta_subtitle','কর্পোরেট ডিল, কাস্টম প্রাইসিং এবং নির্ভরযোগ্য ডেলিভারি','footer','2026-07-21 08:55:15','2026-07-21 08:55:15'),('94adfd68-b0d3-4ffb-8bbb-4a064716bcdf','google_search_console','','tracking','2026-07-21 08:24:50','2026-07-21 08:24:50'),('95f0c95a-96fd-40be-9b17-709b12da47f1','whatsapp_number','01680310063','contact','2026-07-21 08:55:15','2026-07-28 05:01:35'),('968d2b83-e3b9-4f9a-94e0-348556299e70','site_address_bn','ঠিকানা-বাড়ি-২৬, রোড-২, আদাবর, ঢাকা-১২০৭।','general','2026-07-28 05:09:57','2026-07-28 05:09:57'),('97a5b7b4-cfe3-4dea-ad1e-41482c7f9f84','favicon_url','/backend/storage/uploads/site-settings/vTTJvM3pMgYjhEkb2VsBGqgmJ9Av0aXLNENNA0HW.webp','branding','2026-07-21 08:55:15','2026-07-28 05:03:33'),('98d81345-2445-4f6d-8fcb-e682ab7de35a','business_hours','প্রতিদিন সকাল ৯টা - রাত ১০টা','contact','2026-07-21 08:55:15','2026-07-21 08:55:15'),('9c7747e9-c4b9-4faf-9290-30aaf59ab58b','footer_blurb','ড্রিম মার্ট নিয়ে এসেছে ক্রোকারিজ, ব্যাগ, ঘড়ি, ল্যাম্প, খেলনা ও গিফট আইটেম — অরিজিনাল পণ্য সারাদেশে আপনার দোরগোড়ায় পৌঁছে দিই।','footer','2026-07-21 08:55:15','2026-07-29 13:59:05'),('9dbb4ccd-c567-42eb-bab8-09c98423b725','tiktok_access_token','','tracking','2026-07-21 08:24:50','2026-07-21 08:24:50'),('a90fe08b-a37c-49e0-b06a-8c565acde485','visual_search_enabled','true','features','2026-07-21 08:24:51','2026-07-21 08:24:51'),('a928cac5-8b55-11f1-8262-28d0eaec4da6','footer_blurb_bn','ড্রিম মার্ট নিয়ে এসেছে ক্রোকারিজ, ব্যাগ, ঘড়ি, ল্যাম্প, খেলনা ও গিফট আইটেম — অরিজিনাল পণ্য সারাদেশে আপনার দোরগোড়ায় পৌঁছে দিই।','footer','2026-07-29 13:59:05','2026-07-29 13:59:05'),('a928fc1f-8b55-11f1-8262-28d0eaec4da6','footer_blurb_en','Dream Mart brings you crockery, bags, watches, lamps, toys and gift items — original products delivered to your doorstep across the country.','footer','2026-07-29 13:59:05','2026-07-29 13:59:05'),('aec6649c-b6ce-4864-b6b6-fd8cb568527e','site_phone','01680310063','general','2026-07-21 08:55:15','2026-07-28 05:01:35'),('b70ab2d3-d0e7-440d-b690-21078f7bc835','brand_display_mode','logo_only','branding','2026-07-21 08:55:15','2026-07-28 04:44:48'),('beb6db0e-0d97-4c08-b5b5-23474daafa12','logo_size','48','branding','2026-07-21 08:55:15','2026-07-28 04:56:32'),('cf133b48-5256-45f9-9733-71ddbcdcf0a1','facebook_capi_token','','tracking','2026-07-21 08:24:50','2026-07-21 08:24:50'),('cfac0014-c54b-477b-b3b9-21797f947b51','brand_name_size','34','branding','2026-07-21 08:55:15','2026-07-26 02:14:03'),('d044be77-de54-417f-9850-d4ee33ee05f1','footer_cta_title','১০০+ কোম্পানি আমাদের বিশ্বাস করে','footer','2026-07-21 08:55:15','2026-07-21 08:55:15'),('d6c46811-bf14-4d75-8c67-a96ed526d1e4','sales_notification_enabled','true','features','2026-07-21 08:24:51','2026-07-21 08:24:51'),('d7eb6a82-7d22-49d9-823d-f8a5c43943e0','payment_bkash_live_enabled',NULL,'payment','2026-07-26 02:18:51','2026-07-26 02:20:03'),('d81bdac9-7b87-490d-a4a3-00182889df24','seo_title','Dream Mart','seo','2026-07-21 08:55:15','2026-07-21 08:55:15'),('d92910be-b872-4856-bd43-59f0d61def22','payment_bkash_type',NULL,'payment','2026-07-26 02:18:50','2026-07-26 02:20:01'),('e1bdf0ec-4a51-4a0f-a5d9-c9b5ef03a606','site_name','Dream Mart','general','2026-07-21 08:55:15','2026-07-21 08:55:15'),('e63ae7d9-613c-4f55-8aae-5475eecdd859','gradient_mode','solid','branding','2026-07-21 08:55:15','2026-07-29 08:02:10'),('ebc22986-f8a3-4508-b50a-be4ef69ea6d8','payment_bkash_number',NULL,'payment','2026-07-26 02:18:49','2026-07-26 02:20:00'),('f5fe7d09-ba73-4bc8-9393-ed433f69d139','brand_color','#f59e0b','branding','2026-07-21 08:55:15','2026-07-26 01:08:58'),('fe1ecf9e-9e36-442f-9f04-8e95dd229dc9','footer_cta_phone','01985403218','footer','2026-07-21 08:55:15','2026-07-21 08:55:15');
/*!40000 ALTER TABLE `site_settings` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `sizes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sizes` (
  `id` char(36) NOT NULL,
  `name` text NOT NULL,
  `value` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `name_en` text DEFAULT NULL,
  `name_bn` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `sizes` WRITE;
/*!40000 ALTER TABLE `sizes` DISABLE KEYS */;
/*!40000 ALTER TABLE `sizes` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `smtp_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `smtp_settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `mailer` varchar(255) NOT NULL DEFAULT 'smtp',
  `host` varchar(255) DEFAULT NULL,
  `port` int(11) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `encryption` varchar(255) DEFAULT NULL COMMENT 'ssl, tls, null',
  `from_address` varchar(255) DEFAULT NULL,
  `from_name` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `smtp_settings` WRITE;
/*!40000 ALTER TABLE `smtp_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `smtp_settings` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `social_media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `social_media` (
  `id` char(36) NOT NULL,
  `platform` text NOT NULL,
  `url` text NOT NULL,
  `icon` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `social_media` WRITE;
/*!40000 ALTER TABLE `social_media` DISABLE KEYS */;
/*!40000 ALTER TABLE `social_media` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `tracking_events_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tracking_events_log` (
  `id` char(36) NOT NULL,
  `event_name` varchar(255) NOT NULL,
  `event_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`event_data`)),
  `platform` varchar(255) NOT NULL DEFAULT 'web',
  `source` varchar(255) DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `page_url` text DEFAULT NULL,
  `referrer_url` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tracking_events_log_event_name_index` (`event_name`),
  KEY `tracking_events_log_created_at_index` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `tracking_events_log` WRITE;
/*!40000 ALTER TABLE `tracking_events_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `tracking_events_log` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `tracking_pixels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tracking_pixels` (
  `id` char(36) NOT NULL,
  `name` text NOT NULL,
  `type` text NOT NULL,
  `pixel_id` text NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `tracking_pixels` WRITE;
/*!40000 ALTER TABLE `tracking_pixels` DISABLE KEYS */;
/*!40000 ALTER TABLE `tracking_pixels` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_roles` (
  `id` char(36) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_roles_user_id_role_unique` (`user_id`,`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES ('5b573da8-fee3-4d5b-810e-6825169526bc','1','admin','2026-07-21 08:55:15','2026-07-21 08:55:15');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_phone_unique` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin','lotusmostafiz@gmail.com',NULL,'$2y$12$pll2guD.IoXS0dLZ7oEO5eaP8icnjbi/MYCEG/ygWHz2SSAmT7Tiu',NULL,'2026-07-21 08:55:15','2026-07-29 06:15:09',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `videos` (
  `id` char(36) NOT NULL,
  `title` text NOT NULL,
  `video_url` text NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `thumbnail_url` text DEFAULT NULL,
  `title_en` text DEFAULT NULL,
  `title_bn` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `videos` WRITE;
/*!40000 ALTER TABLE `videos` DISABLE KEYS */;
INSERT INTO `videos` VALUES ('7bea102d-e1c5-4293-b1f4-8fa756afe713','নূরস গুলমিনা পাকিস্তানি শিফন লাক্সারি থ্রি-পিস কালেকশন','https://youtu.be/BaBYF3YdaI4?si=Z68t9Tp1dwtHwi8N',4,1,'2026-07-21 08:24:50','2026-07-29 06:23:27',NULL,'Noor\'s Gulmina Pakistani Chiffon Luxury Dress Collection','নূরস গুলমিনা পাকিস্তানি শিফন লাক্সারি থ্রি-পিস কালেকশন'),('aad473a6-2eed-4a15-b65d-8d18b88e73ef','নতুন জুতার কালেকশন ও দাম','https://www.youtube.com/watch?v=HEB1YN-pho0',3,1,'2026-07-21 08:24:50','2026-07-29 06:34:49',NULL,'Latest Shoes Collection Video','নতুন জুতার কালেকশন ও দাম'),('db6cd3a9-3533-4322-aa1e-b4cf0d9a1665','নতুন ব্রাইডাল জুয়েলারি ও কসমেটিকস সংগ্রহ','ttps://www.youtube.com/watch?v=jYs8LPYVZyE',1,1,'2026-07-21 08:24:50','2026-07-29 06:35:38',NULL,'Latest Bridal Jewelry & Beauty Products Collection','নতুন ব্রাইডাল জুয়েলারি ও কসমেটিকস সংগ্রহ'),('e932e5cc-347c-44fd-aa96-49d85c63f51e','খেলাধুলার সামগ্রীর সংগ্রহ','https://www.youtube.com/watch?v=LUgmLnho-uo',2,1,'2026-07-21 08:24:50','2026-07-29 06:37:44',NULL,'SPORTING GOODS COLLECTION','খেলাধুলার সামগ্রীর সংগ্রহ');
/*!40000 ALTER TABLE `videos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;



SET FOREIGN_KEY_CHECKS = 1;
