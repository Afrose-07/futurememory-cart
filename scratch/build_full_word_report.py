import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_full_report():
    doc = Document()
    
    # Page setup - A4 with 1 inch margins
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        
    # Styling helper
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = RGBColor(0, 0, 0)
    normal_style.paragraph_format.line_spacing = 1.25
    normal_style.paragraph_format.space_after = Pt(6)

    def set_cell_background(cell, fill_hex):
        shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
        cell._tc.get_or_add_tcPr().append(shading)

    def add_custom_heading(text, level, space_before=12, space_after=6, align=WD_ALIGN_PARAGRAPH.LEFT):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Times New Roman'
        if level == 1:
            run.font.size = Pt(16)
        elif level == 2:
            run.font.size = Pt(14)
        elif level == 3:
            run.font.size = Pt(12.5)
        return p

    def add_p(text, bold_prefix="", italic=False, align=WD_ALIGN_PARAGRAPH.JUSTIFY):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.line_spacing = 1.25
        p.paragraph_format.space_after = Pt(6)
        if bold_prefix:
            r_b = p.add_run(bold_prefix)
            r_b.bold = True
            r_b.font.name = 'Times New Roman'
        r = p.add_run(text)
        r.italic = italic
        r.font.name = 'Times New Roman'
        return p

    def add_bullet(text, bold_prefix=""):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.2
        if bold_prefix:
            r_b = p.add_run(bold_prefix)
            r_b.bold = True
            r_b.font.name = 'Times New Roman'
        r = p.add_run(text)
        r.font.name = 'Times New Roman'
        return p

    def add_table_data(headers, rows, caption=""):
        table = doc.add_table(rows=len(rows) + 1, cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = True
        
        # Format Header
        hdr_cells = table.rows[0].cells
        for i, header_text in enumerate(headers):
            hdr_cells[i].text = header_text
            set_cell_background(hdr_cells[i], "E5E7EB")
            p = hdr_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.space_before = Pt(2)
            for r in p.runs:
                r.bold = True
                r.font.name = 'Times New Roman'
                r.font.size = Pt(10.5)

        # Format Rows
        for r_idx, row_data in enumerate(rows):
            row_cells = table.rows[r_idx + 1].cells
            for c_idx, cell_value in enumerate(row_data):
                row_cells[c_idx].text = str(cell_value)
                p = row_cells[c_idx].paragraphs[0]
                p.paragraph_format.space_after = Pt(2)
                p.paragraph_format.space_before = Pt(2)
                for r in p.runs:
                    r.font.name = 'Times New Roman'
                    r.font.size = Pt(10)

        # Apply borders
        tblPr = table._tbl.tblPr
        borders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>'
            f'<w:top w:val="single" w:sz="4" w:space="0" w:color="333333"/>'
            f'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="333333"/>'
            f'<w:left w:val="none"/>'
            f'<w:right w:val="none"/>'
            f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>'
            f'<w:insideV w:val="none"/>'
            f'</w:tblBorders>'
        )
        tblPr.append(borders)
        
        if caption:
            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_after = Pt(12)
            r = p_cap.add_run(caption)
            r.italic = True
            r.font.name = 'Times New Roman'
            r.font.size = Pt(10)
        else:
            p_space = doc.add_paragraph()
            p_space.paragraph_format.space_after = Pt(8)

    def add_figure_placeholder(fig_label, caption):
        p_fig = doc.add_paragraph()
        p_fig.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_fig.paragraph_format.space_before = Pt(10)
        p_fig.paragraph_format.space_after = Pt(2)
        r_box = p_fig.add_run(f"[ {fig_label} Screen View ]")
        r_box.bold = True
        r_box.font.name = 'Consolas'
        r_box.font.size = Pt(10)
        r_box.font.color.rgb = RGBColor(70, 70, 70)
        
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(14)
        r = p_cap.add_run(f"{fig_label} {caption}")
        r.italic = True
        r.font.name = 'Times New Roman'
        r.font.size = Pt(10.5)

    # =========================================================================
    # PAGE 1: TITLE PAGE
    # =========================================================================
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(40)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("FUTUREMEMORY CART – A PERSONALIZED E-COMMERCE PLATFORM\n")
    r.bold = True
    r.font.size = Pt(16)
    
    r_sub = p.add_run("23CS54C – MODERN WEB TECHNOLOGIES\n\n\n")
    r_sub.bold = True
    r_sub.font.size = Pt(13)
    
    r_by = p.add_run("Submitted by\n\n")
    r_by.font.size = Pt(12)
    
    r_name = p.add_run("GANGADEVI P  (2403957610422103)\n\n\n")
    r_name.bold = True
    r_name.font.size = Pt(13)
    
    r_deg = p.add_run("In partial fulfillment for the award of the degree\nof\nBACHELOR OF ENGINEERING\nin\nCOMPUTER SCIENCE AND ENGINEERING\n\n\n")
    r_deg.font.size = Pt(12)
    r_deg.italic = True
    
    r_clg = p.add_run("NATIONAL ENGINEERING COLLEGE\n(An Autonomous Institution affiliated to Anna University, Chennai)\nK.R.NAGAR, KOVILPATTI - 628503\n\nOCTOBER - 2026")
    r_clg.bold = True
    r_clg.font.size = Pt(13)
    
    doc.add_page_break()

    # =========================================================================
    # PAGE 2: BONAFIDE CERTIFICATE
    # =========================================================================
    add_custom_heading("NATIONAL ENGINEERING COLLEGE\n(An Autonomous Institution affiliated to Anna University, Chennai)\nK.R.NAGAR, KOVILPATTI - 628503", 2, space_before=20, space_after=30, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    add_custom_heading("BONAFIDE CERTIFICATE", 1, space_before=10, space_after=30, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    add_p(
        "This is to certify that this project report, “FutureMemory Cart – A Personalized E-Commerce Platform”, "
        "is the bonafide work of GANGADEVI P (2403957610422103) who carried out the project work under my supervision.",
        align=WD_ALIGN_PARAGRAPH.JUSTIFY
    )
    
    p_sign = doc.add_paragraph()
    p_sign.paragraph_format.space_before = Pt(80)
    p_sign.paragraph_format.space_after = Pt(60)
    p_sign.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_s = p_sign.add_run("Course Instructor / Guide        ")
    r_s.bold = True

    add_p(
        "Submitted to the 23CS54C – MODERN WEB TECHNOLOGIES Viva-Voce examination held at "
        "National Engineering College, K.R.Nagar, Kovilpatti on ____________________\n\n\n"
    )

    p_exam = doc.add_paragraph()
    p_exam.paragraph_format.space_before = Pt(30)
    r_ex1 = p_exam.add_run("Internal Examiner")
    r_ex1.bold = True
    p_exam.add_run("                                                                    ")
    r_ex2 = p_exam.add_run("Co Examiner")
    r_ex2.bold = True
    
    doc.add_page_break()

    # =========================================================================
    # PAGE 3: TABLE OF CONTENTS
    # =========================================================================
    add_custom_heading("TABLE OF CONTENTS", 1, space_before=10, space_after=20, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    toc_headers = ["CH NO", "TITLE", "PAGE NO"]
    toc_rows = [
        ["1", "INTRODUCTION", "3"],
        ["2", "OBJECTIVES", "4"],
        ["3", "DESCRIPTION", "5"],
        ["4", "CLASS DIAGRAM", "6"],
        ["5", "TABLE STRUCTURES", "7"],
        ["6", "ER DIAGRAM", "14"],
        ["7", "TECH STACK", "16"],
        ["8", "MODULES", "17"],
        ["9", "CONCLUSION", "55"]
    ]
    add_table_data(toc_headers, toc_rows)
    
    doc.add_page_break()

    # =========================================================================
    # PAGE 4: CHAPTER 1 - INTRODUCTION
    # =========================================================================
    add_custom_heading("CHAPTER 1\nINTRODUCTION", 1, space_before=10, space_after=18, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    add_p(
        "Modern consumer e-commerce platforms excel at immediate, impulse-driven product purchases. "
        "However, they systematically overlook a fundamental facet of human relationships and social celebrations: "
        "recurrent milestone gifting, advance celebration planning, and automated calendar-linked fulfillment. "
        "Millions of individuals frequently miss critical dates—birthdays of family members, marriage anniversaries, "
        "annual cultural festivals like Pongal and Diwali, or career milestones—due to busy professional lives, "
        "resulting in rushed orders, stock shortages, high expedited shipping costs, and avoidable interpersonal regret."
    )
    
    add_p(
        "FutureMemory Cart is a full-stack, personalized occasion-driven e-commerce platform built to solve this challenge. "
        "The application introduces the proprietary Memory Cart paradigm: a persistent scheduling system where members can "
        "curate thoughtful physical gifts months in advance, attach exact delivery dates and milestone reminder offsets "
        "(1 day, 3 days, or 1 week before), and establish recurring annual auto-fulfillment. When a celebration approaches, "
        "the platform automatically sends real-time WhatsApp Web notifications and Nodemailer verification emails, ensuring "
        "zero missed milestones."
    )
    
    add_p(
        "The application is organised into seven functional modules: User Authentication & Access Control, "
        "Occasion-Based Catalog & Discovery (34 Occasions, 1,020 Products), Memory Cart & Scheduled Future Delivery, "
        "Shopping Cart, Checkout & Simulated Payment, Communication, Notifications & MemoryBot, Reviews, Ratings & "
        "Multilingual Personalization, and the Admin Console & Analytics. It is built on the modern web stack: a React 18 "
        "single-page application (Vite, Context API, React Router) communicates with an Express 4 and Node.js REST API "
        "backed by persistent document and relational data models. The interface is completely multilingual, supporting "
        "English, Tamil, and Hindi with four dynamic color themes."
    )
    
    add_p(
        "This report documents the design, development, and implementation of FutureMemory Cart: its objectives, "
        "class and entity-relationship architecture, collection schemas, technology stack, detailed module designs "
        "(functional requirements, non-functional requirements, REST API contracts, database schemas, and interface walkthroughs), "
        "and the project conclusion."
    )

    doc.add_page_break()

    # =========================================================================
    # PAGE 5: CHAPTER 2 - OBJECTIVES
    # =========================================================================
    add_custom_heading("CHAPTER 2\nOBJECTIVES", 1, space_before=10, space_after=18, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    add_p("The objectives of FutureMemory Cart are:")
    
    add_bullet(" – enable shoppers to curate and lock in orders for exact future dates with automatic reminder triggers and annual recurring schedules.", "• Automate Future Delivery")
    add_bullet(" – organize product exploration around 34 real-world celebrations across four major categories rather than generic retail hierarchies.", "• Contextual Occasion Discovery")
    add_bullet(" – deliver transactional alerts and milestone reminders via WhatsApp Web automation, Nodemailer HTML emails, and in-app notification toasts.", "• Multi-Channel Notifications")
    add_bullet(" – assist shoppers in discovering perfect gifts based on occasion, recipient, and budget using a bilingual (English & Tamil) floating conversational agent.", "• Interactive AI Concierge (MemoryBot)")
    add_bullet(" – maintain a curated inventory of 1,020 genuine retail gifts (watches, luxury hampers, lamps, jewelry, leatherware) with zero food or drink items.", "• Zero Loose Food Policy")
    add_bullet(" – use bcrypt password hashing, signed JSON Web Tokens (JWT), Google OAuth simulation, and 6-digit OTP email verification for password recovery.", "• Provide a Secure Foundation")
    add_bullet(" – offer realistic UPI QR generation, card authorization, and Cash on Delivery with downloadable digital receipts.", "• Simulated Checkout & Receipts")
    add_bullet(" – empower store managers to monitor revenue, update product stock, govern user accounts, and track orders across their full lifecycle.", "• Centralized Administrator Control")
    add_bullet(" – provide seamless client-side runtime switching between English, Tamil, and Hindi alongside four curated visual themes without page reloads.", "• Multilingual & Multi-Theme Design")
    add_bullet(" – maintain a seeded local dataset in browser storage so key features remain accessible even during network offline states.", "• Offline Resilience")

    doc.add_page_break()

    # =========================================================================
    # PAGE 6: CHAPTER 3 - DESCRIPTION
    # =========================================================================
    add_custom_heading("CHAPTER 3\nDESCRIPTION", 1, space_before=10, space_after=18, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    add_p(
        "FutureMemory Cart is a web application for occasion-driven shopping, memory preservation, and scheduled future gifting. "
        "A visitor lands on an interactive storefront, browses curated collections by celebratory occasion, and signs in to unlock "
        "personalized features. The navigation bar provides access to: Explore Catalog, Memory Cart, Standard Cart, Wishlist, "
        "Order History, Notifications, and Customer Profile. A floating MemoryBot assistant is available across every screen."
    )
    
    add_p(
        "The system is organized into three core functional areas: Catalogue & Occasion Management covers 34 categorized "
        "occasions (Birthdays, Weddings, Anniversaries, Pongal, Diwali, Graduation, Corporate, Travel, Pet Birthdays, etc.) "
        "and 1,020 verified physical products. Transaction Management covers the dual-cart lifecycle: immediate cart orders "
        "and scheduled Memory Cart bookings with status tracking (Confirmed, Processing, Shipped, Delivered, and Cancelled). "
        "Communication & Administration covers real-time WhatsApp dispatches, Nodemailer verification emails, customer reviews, "
        "and the administrative oversight console."
    )
    
    add_p(
        "Two roles exist: A customer can browse products, manage their cart and wishlist, schedule memory deliveries, place orders, "
        "receive notifications, and write reviews. An administrator signs in via a separate portal (`/admin`) and can inspect "
        "system-wide sales analytics, modify user status, track all active orders, manage product inventory, and verify occasion data."
    )
    
    add_p(
        "FutureMemory Cart operates in two cooperating modes: The React client retains a seeded, working dataset in browser local "
        "storage, allowing seamless catalog browsing and offline interaction. When the Express REST API is online, data modifications "
        "mirror to the server database with signed Bearer token authorization. Payments are processed through a simulated checkout "
        "(UPI QR code, Card, NetBanking, COD) that records transaction references and issues instant printable invoices."
    )

    doc.add_page_break()

    # =========================================================================
    # PAGE 7: CHAPTER 4 - CLASS DIAGRAM
    # =========================================================================
    add_custom_heading("CHAPTER 4\nCLASS DIAGRAM", 1, space_before=10, space_after=18, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    add_p(
        "The class diagram shows the persistent domain entities of FutureMemory Cart together with the controller operations "
        "that act upon them. Every domain model is represented as a class with its attributes and associated controller methods. "
        "Logical associations link entities: User.id is referenced by Order.userId and MemoryCartItem.userId, while Product.id "
        "is referenced across Cart, Memory Cart, and Review entities."
    )
    
    class_diag_text = (
        "+--------------------------------------+       +--------------------------------------+\n"
        "|                 User                 |       |               Product                |\n"
        "+--------------------------------------+       +--------------------------------------+\n"
        "| - id: String [PK]                    |       | - id: String [PK]                    |\n"
        "| - name: String                       |       | - modelId: String                    |\n"
        "| - email: String [UNI]                |       | - name: String                       |\n"
        "| - password: String (bcrypt)          |       | - category: String                   |\n"
        "| - phone: String                      |       | - subcategory: String                |\n"
        "| - address: String                    |       | - brand: String                      |\n"
        "| - role: enum(user, admin)            |       | - price: Number                      |\n"
        "| - status: enum(Active, Suspended)    |       | - originalPrice: Number              |\n"
        "| - avatar: String                     |       | - discount: Number                   |\n"
        "+--------------------------------------+       | - images: Object                     |\n"
        "| + register(req, res): JSON           |       | - colors: Array                      |\n"
        "| + login(req, res): JSON              |       | - rating: Number                     |\n"
        "| + sendOtp(req, res): JSON            |       | - stock: Number                      |\n"
        "| + resetPassword(req, res): JSON      |       | - occasion: Array                    |\n"
        "| + updateProfile(req, res): JSON      |       +--------------------------------------+\n"
        "+--------------------------------------+       | + getAllProducts(): JSON             |\n"
        "                   | 1                         | + getProductById(id): JSON           |\n"
        "                   |                           | + createProduct(data): JSON          |\n"
        "                   | schedules                 +--------------------------------------+\n"
        "                   v *                                            ^\n"
        "+--------------------------------------+                          |\n"
        "|            MemoryCartItem            |                          | targeted by\n"
        "+--------------------------------------+                          |\n"
        "| - id: String [PK]                    |                          |\n"
        "| - userId: String [FK -> User]        |                          |\n"
        "| - productId: String [FK -> Product]  |--------------------------+\n"
        "| - targetDeliveryDate: Date           |\n"
        "| - occasionType: String               |\n"
        "| - reminderOffsetDays: Number         |\n"
        "| - recipientName: String              |\n"
        "| - recipientPhone: String             |\n"
        "| - status: String                     |\n"
        "+--------------------------------------+\n"
        "| + scheduleMemory(req, res): JSON     |\n"
        "| + cancelMemory(id): JSON             |\n"
        "+--------------------------------------+\n"
        "                   | 1\n"
        "                   | places\n"
        "                   v *\n"
        "+--------------------------------------+       +--------------------------------------+\n"
        "|                Order                 |       |             Notification             |\n"
        "+--------------------------------------+       +--------------------------------------+\n"
        "| - id: String [PK]                    |       | - id: String [PK]                    |\n"
        "| - orderNumber: String                |       | - userId: String [FK -> User]        |\n"
        "| - userId: String [FK -> User]        |       | - channel: enum(InApp, WhatsApp, Mail|\n"
        "| - items: Array [Product refs]        |       | - type: String                       |\n"
        "| - totalAmount: Number                |       | - title: String                      |\n"
        "| - paymentMethod: String              |       | - message: String                    |\n"
        "| - paymentStatus: String              |       | - isRead: Boolean                    |\n"
        "| - orderStatus: String                |       | - timestamp: Date                    |\n"
        "+--------------------------------------+       +--------------------------------------+\n"
        "| + createOrder(req, res): JSON        |       | + dispatchNotification(): Void       |\n"
        "| + updateStatus(id, status): JSON     |       | + markAsRead(id): JSON               |\n"
        "+--------------------------------------+       +--------------------------------------+"
    )
    
    p_box = doc.add_paragraph()
    p_box.paragraph_format.space_before = Pt(8)
    p_box.paragraph_format.space_after = Pt(8)
    r_cd = p_box.add_run(class_diag_text)
    r_cd.font.name = 'Consolas'
    r_cd.font.size = Pt(8)
    
    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_after = Pt(14)
    r = p_cap.add_run("Fig 4.1 Class diagram of FutureMemory Cart")
    r.italic = True
    r.font.name = 'Times New Roman'
    r.font.size = Pt(10.5)

    doc.add_page_break()

    # =========================================================================
    # PAGES 8-14: CHAPTER 5 - TABLE STRUCTURES
    # =========================================================================
    add_custom_heading("CHAPTER 5\nTABLE STRUCTURES", 1, space_before=10, space_after=18, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    add_p(
        "FutureMemory Cart uses document-oriented storage with relational key structures across eleven primary collections. "
        "Each table below details the schema of one collection: field name, data type, whether it is required, key constraint "
        "(PRI primary key, UNI unique, FK foreign key reference), and default values. Every document automatically receives "
        "a unique identifier, with timestamps tracking creation and updates."
    )
    
    # 5.1 USERS
    add_custom_heading("5.1 USERS (users)", 2, space_before=14, space_after=6)
    add_p("Stores registered customer profiles. Passwords are stored only as salted bcrypt hashes; role separates customers from administrators.")
    users_hdr = ["Field", "Type", "Required", "Key", "Default"]
    users_rows = [
        ["_id", "ObjectId", "Yes", "PRI", "auto"],
        ["id", "String", "Yes", "UNI", "USR-1001"],
        ["name", "String (trim)", "Yes", "", "None"],
        ["email", "String (lowercase)", "Yes", "UNI", "None"],
        ["password", "String (bcrypt hash)", "Yes", "", "None"],
        ["phone", "String", "No", "", "+91 98401 23456"],
        ["address", "String", "No", "", "Chennai, Tamil Nadu"],
        ["role", "enum(user, admin)", "No", "", "user"],
        ["status", "enum(Active, Suspended)", "No", "", "Active"],
        ["avatar", "String (URL)", "No", "", "null"],
        ["preferences", "Object {theme, lang}", "No", "", "{'Emerald Mint', 'en'}"],
        ["createdAt / updatedAt", "Date", "No", "", "timestamps"]
    ]
    add_table_data(users_hdr, users_rows, "Table 5.1 Structure of the users collection")

    # 5.2 ADMINS
    add_custom_heading("5.2 ADMINS (admins)", 2, space_before=14, space_after=6)
    add_p("Holds administrator credentials used by the separate administrative dashboard portal.")
    admins_hdr = ["Field", "Type", "Required", "Key", "Default"]
    admins_rows = [
        ["_id", "ObjectId", "Yes", "PRI", "auto"],
        ["id", "String", "Yes", "UNI", "ADM-01"],
        ["name", "String", "Yes", "", "Admin"],
        ["email", "String (lowercase)", "Yes", "UNI", "admin@futurememory.com"],
        ["password", "String (bcrypt hash)", "Yes", "", "None"],
        ["role", "String", "No", "", "SuperAdmin"],
        ["createdAt / lastLogin", "Date", "No", "", "timestamps"]
    ]
    add_table_data(admins_hdr, admins_rows, "Table 5.2 Structure of the admins collection")

    # 5.3 OCCASIONS
    add_custom_heading("5.3 OCCASIONS (occasions)", 2, space_before=14, space_after=6)
    add_p("Master list of 34 cultural, personal, and career gift occasions organized across 4 groups.")
    occ_hdr = ["Field", "Type", "Required", "Key", "Default"]
    occ_rows = [
        ["_id", "ObjectId", "Yes", "PRI", "auto"],
        ["id", "String", "Yes", "UNI", "birthday"],
        ["name", "String (trim)", "Yes", "UNI", "Birthdays"],
        ["group", "String", "Yes", "", "Celebrations & Gifts"],
        ["icon", "String (symbol)", "No", "", "🎂"],
        ["description", "String", "Yes", "", "Curated gifts..."],
        ["image", "String (URL)", "Yes", "", "Unsplash high-res"],
        ["prefix", "String", "Yes", "", "BDY"]
    ]
    add_table_data(occ_hdr, occ_rows, "Table 5.3 Structure of the occasions collection")

    # 5.4 PRODUCTS
    add_custom_heading("5.4 PRODUCTS (products)", 2, space_before=14, space_after=6)
    add_p("The catalog of 1,020 verified physical gift items. Zero food or drink items; verified retail imagery.")
    prod_hdr = ["Field", "Type", "Required", "Key", "Default"]
    prod_rows = [
        ["_id", "ObjectId", "Yes", "PRI", "auto"],
        ["id", "String", "Yes", "UNI", "BDY-01"],
        ["modelId", "String", "Yes", "", "MDL-BDY-01"],
        ["name", "String (trim)", "Yes", "", "None"],
        ["category", "String", "Yes", "FK*", "Occasion.name"],
        ["subcategory", "String", "Yes", "", "Photo Frames"],
        ["brand", "String", "No", "", "ArtisanStudio"],
        ["description", "String", "Yes", "", "Premium specs..."],
        ["price", "Number", "Yes", "", "499"],
        ["originalPrice", "Number", "Yes", "", "899"],
        ["discount", "Number", "No", "", "44"],
        ["images", "Object {front, back, side}", "Yes", "", "High-res URLs"],
        ["colors / sizes", "Array of Strings", "No", "", "['Standard']"],
        ["rating / reviewCount", "Number", "No", "", "4.8 / 142"],
        ["stock", "Number", "Yes", "", "35"],
        ["occasion", "Array of Strings", "Yes", "FK", "['birthday']"],
        ["tags", "Array of Strings", "No", "", "['gift', 'frame']"]
    ]
    add_table_data(prod_hdr, prod_rows, "Table 5.4 Structure of the products collection")

    # 5.5 MEMORY_CART
    add_custom_heading("5.5 MEMORY_CART (memory_cart)", 2, space_before=14, space_after=6)
    add_p("Dedicated registry of scheduled milestone deliveries, reminder offsets, and recipient details.")
    mem_hdr = ["Field", "Type", "Required", "Key", "Default"]
    mem_rows = [
        ["_id", "ObjectId", "Yes", "PRI", "auto"],
        ["id", "String", "Yes", "UNI", "MEM-9021"],
        ["userId", "String", "Yes", "FK", "User.id"],
        ["productId", "String", "Yes", "FK", "Product.id"],
        ["targetDeliveryDate", "Date", "Yes", "", "2026-11-15"],
        ["occasionType", "String", "Yes", "FK", "Occasion.id"],
        ["reminderOffsetDays", "Number", "Yes", "", "3"],
        ["recipientName", "String", "Yes", "", "Karthik"],
        ["recipientPhone", "String", "Yes", "", "+91 98402 34567"],
        ["recipientAddress", "String", "Yes", "", "Kovilpatti"],
        ["status", "enum(Scheduled, Dispatched, Cancelled)", "Yes", "", "Scheduled"],
        ["isRecurringAnnual", "Boolean", "No", "", "false"]
    ]
    add_table_data(mem_hdr, mem_rows, "Table 5.5 Structure of the memory_cart collection")

    # 5.6 ORDERS
    add_custom_heading("5.6 ORDERS (orders)", 2, space_before=14, space_after=6)
    add_p("Full record of checkout orders, payment status, timeline tracker, and financial breakdown.")
    ord_hdr = ["Field", "Type", "Required", "Key", "Default"]
    ord_rows = [
        ["_id", "ObjectId", "Yes", "PRI", "auto"],
        ["id", "String", "Yes", "UNI", "ORD-2026-1049"],
        ["userId", "String", "Yes", "FK", "User.id"],
        ["items[]", "Array of Objects", "Yes", "FK", "[{productId, qty, price}]"],
        ["subtotal / tax / total", "Number", "Yes", "", "Computed in INR"],
        ["shippingAddress", "String", "Yes", "", "Address text"],
        ["paymentMethod", "enum(UPI, Card, NetBanking, COD)", "Yes", "", "UPI"],
        ["paymentStatus", "enum(Paid, Pending, Failed)", "Yes", "", "Paid"],
        ["transactionId", "String", "Yes", "", "TXN-8491024"],
        ["orderStatus", "enum(Confirmed, Shipped, Delivered)", "Yes", "", "Confirmed"],
        ["timeline[]", "Array of {step, time}", "No", "", "[{step: 'Confirmed'}]"]
    ]
    add_table_data(ord_hdr, ord_rows, "Table 5.6 Structure of the orders collection")

    # 5.7 NOTIFICATIONS
    add_custom_heading("5.7 NOTIFICATIONS (notifications)", 2, space_before=14, space_after=6)
    add_p("Multi-channel transactional alerts across WhatsApp, Nodemailer Email, and in-app toasts.")
    notif_hdr = ["Field", "Type", "Required", "Key", "Default"]
    notif_rows = [
        ["_id", "ObjectId", "Yes", "PRI", "auto"],
        ["id", "String", "Yes", "UNI", "NOTIF-501"],
        ["userId", "String", "Yes", "FK", "User.id"],
        ["channel", "enum(InApp, WhatsApp, Email)", "Yes", "", "WhatsApp"],
        ["type", "enum(Order, Milestone, Promo)", "Yes", "", "Milestone"],
        ["title / message", "String", "Yes", "", "Notification body"],
        ["isRead", "Boolean", "No", "", "false"],
        ["timestamp", "Date", "No", "", "now"]
    ]
    add_table_data(notif_hdr, notif_rows, "Table 5.7 Structure of the notifications collection")

    # 5.8 REVIEWS & WISHLISTS
    add_custom_heading("5.8 REVIEWS & WISHLISTS (reviews / wishlists)", 2, space_before=14, space_after=6)
    add_p("Customer ratings, written feedback testimonials, and user-bookmarked items.")
    rev_hdr = ["Field", "Type", "Required", "Key", "Default"]
    rev_rows = [
        ["_id", "ObjectId", "Yes", "PRI", "auto"],
        ["id", "String", "Yes", "UNI", "REV-301"],
        ["productId", "String", "Yes", "FK", "Product.id"],
        ["userId", "String", "Yes", "FK", "User.id"],
        ["userName", "String", "Yes", "", "Ganga Devi"],
        ["rating", "Number (1 to 5)", "Yes", "", "5"],
        ["comment", "String", "Yes", "", "Outstanding quality"],
        ["date", "Date", "No", "", "today"]
    ]
    add_table_data(rev_hdr, rev_rows, "Table 5.8 Structure of the reviews collection")

    doc.add_page_break()

    # =========================================================================
    # PAGES 15-16: CHAPTER 6 - ER DIAGRAM & RELATIONSHIPS
    # =========================================================================
    add_custom_heading("CHAPTER 6\nER DIAGRAM", 1, space_before=10, space_after=18, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    add_p(
        "The entity-relationship diagram shows how collections correlate across the platform. Logical foreign key references "
        "are enforced in controller pipelines. The users collection forms the operational hub: a member schedules memory carts, "
        "places orders, receives notifications, bookmarks wishlists, and writes reviews."
    )
    
    er_text = (
        "  +-------------+                 1:N                 +-------------+\n"
        "  |    users    |------------------------------------>|   orders    |\n"
        "  +-------------+                                     +-------------+\n"
        "         | 1                                                 | 1\n"
        "         |                                                   | contains\n"
        "         | 1:N                                               v N\n"
        "         v                                            +-------------+\n"
        "  +-------------+         targets 1                   |  products   |\n"
        "  | memory_cart |------------------------------------>+-------------+\n"
        "  +-------------+                                            ^ N\n"
        "         | 1                                                 |\n"
        "         | receives                                          | categorizes 1:N\n"
        "         v N                                                 |\n"
        "  +-------------+                                     +-------------+\n"
        "  |notifications|                                     |  occasions  |\n"
        "  +-------------+                                     +-------------+\n"
    )
    
    p_er = doc.add_paragraph()
    p_er.paragraph_format.space_before = Pt(8)
    p_er.paragraph_format.space_after = Pt(8)
    r_er = p_er.add_run(er_text)
    r_er.font.name = 'Consolas'
    r_er.font.size = Pt(8.5)
    
    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_after = Pt(14)
    r = p_cap.add_run("Fig 6.1 Entity relationship diagram of FutureMemory Cart")
    r.italic = True
    r.font.name = 'Times New Roman'
    r.font.size = Pt(10.5)

    add_custom_heading("RELATIONSHIP SUMMARY", 2, space_before=14, space_after=8)
    rel_hdr = ["Parent", "Child", "Cardinality", "Reference Field"]
    rel_rows = [
        ["users", "orders", "1 : N", "orders.userId -> users.id"],
        ["users", "memory_cart", "1 : N", "memory_cart.userId -> users.id"],
        ["products", "memory_cart", "1 : N", "memory_cart.productId -> products.id"],
        ["occasions", "products", "1 : N", "products.occasion -> occasions.id"],
        ["users", "notifications", "1 : N", "notifications.userId -> users.id"],
        ["users", "wishlists", "1 : 1", "wishlists.userId -> users.id (unique)"],
        ["products", "reviews", "1 : N", "reviews.productId -> products.id"],
        ["users", "reviews", "1 : N", "reviews.userId -> users.id"]
    ]
    add_table_data(rel_hdr, rel_rows)

    doc.add_page_break()

    # =========================================================================
    # PAGES 16-17: CHAPTER 7 - TECH STACK & ARCHITECTURE
    # =========================================================================
    add_custom_heading("CHAPTER 7\nTECH STACK", 1, space_before=10, space_after=18, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    add_custom_heading("7.1 TECH STACK", 2, space_before=10, space_after=8)
    ts_hdr = ["Layer", "Technology", "Purpose"]
    ts_rows = [
        ["Frontend UI", "React 18 (Vite)", "Single-page application with reactive components"],
        ["Routing", "React Router 6", "Public, authenticated member, and admin protected guards"],
        ["State Management", "React Context API", "Cart, Memory Cart, Auth, Notifications, Language, Theme"],
        ["Icons & Assets", "Lucide React", "Lightweight scalable SVG iconography"],
        ["Backend Server", "Node.js with Express 4", "RESTful API micro-services and business logic controllers"],
        ["Authentication", "JSON Web Tokens (JWT)", "Signed 7-day bearer tokens for stateless authorization"],
        ["Password Security", "bcryptjs", "Salted one-way hashing for secure credential persistence"],
        ["Email Service", "Nodemailer (Gmail SMTP)", "Automated 6-digit OTP verification and order invoices"],
        ["WhatsApp Engine", "WhatsApp Web Automation", "Instant direct WhatsApp milestone reminder dispatches"],
        ["Database", "MongoDB / SQLite", "Document and relational persistence for catalog and orders"],
        ["Internationalisation", "Custom Translation Dict", "Live runtime switching between English, Tamil, and Hindi"],
        ["Visual Themes", "CSS Custom Properties", "Dynamic color switching across 4 curated themes"]
    ]
    add_table_data(ts_hdr, ts_rows)

    add_custom_heading("7.2 ARCHITECTURE OVERVIEW", 2, space_before=14, space_after=8)
    arch_hdr = ["Layer", "Technology", "Purpose"]
    arch_rows = [
        ["Model", "Schemas & Collections", "Defines data integrity, handles queries, and validation rules"],
        ["View", "React Components & Pages", "Renders responsive UI, captures events, communicates via api.js"],
        ["Controller", "Express Route Controllers", "Executes business logic, authenticates tokens, handles payloads"]
    ]
    add_table_data(arch_hdr, arch_rows)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 8: MODULES (DETAILED 5-STEP STRUCTURE FOR ALL 7 MODULES)
    # =========================================================================
    add_custom_heading("CHAPTER 8\nMODULES", 1, space_before=10, space_after=18, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    add_custom_heading("8.1 Design Approach", 2, space_before=10, space_after=8)
    add_p(
        "Each module of FutureMemory Cart is described the way a system design problem is solved: by walking through "
        "the same steps in the same order, every time. This keeps the explanation of every module complete and comparable, "
        "and shows why each architectural decision was taken rather than only what the screen looks like."
    )
    
    da_hdr = ["Step", "Question it answers", "Presented in each module as"]
    da_rows = [
        ["1. Functional requirements", "What must the module do?", "Section x.1"],
        ["2. Non-functional requirements", "How well must it do it (security, latency)?", "Section x.2"],
        ["3. API design", "What is the contract between client and server?", "Section x.3"],
        ["4. DB design", "Which collections, keys and indexes store the data?", "Section x.4"],
        ["5. Screenshots", "What does the finished interface look like?", "Section x.5"]
    ]
    add_table_data(da_hdr, da_rows)

    add_custom_heading("8.2 Folder Structure", 2, space_before=14, space_after=8)
    add_p("The project is organized cleanly with separate frontend components and backend server controllers.")
    
    add_figure_placeholder("Fig 8.1", "Structure of backend folder (server, routes, controllers, models)")
    add_figure_placeholder("Fig 8.2", "Structure of frontend folder (src, components, pages, context, data)")

    # -------------------------------------------------------------------------
    # 8.3 MODULE 1: USER AUTHENTICATION & ACCESS CONTROL
    # -------------------------------------------------------------------------
    add_custom_heading("8.3 USER AUTHENTICATION & ACCESS CONTROL", 2, space_before=16, space_after=8)
    add_p("Purpose & Scope", bold_prefix="• ")
    add_p(
        "Provides account registration, user sign-in, session maintenance, password recovery, and role-based access control. "
        "It identifies every member with a signed JSON Web Token, separates customers from administrators, and secures routes."
    )
    
    add_p("Functional Requirements", bold_prefix="• ")
    add_bullet(" – visitor can register with name, email, phone, address, and password.", "User Registration")
    add_bullet(" – member logs in with email and password and receives a signed 7-day JWT bearer token.", "Secure Sign-in")
    add_bullet(" – instant 1-click test credentials for evaluators without manual typing.", "Quick Demo Accounts")
    add_bullet(" – delivers a 6-digit OTP code to the registered email address via Nodemailer.", "OTP Password Recovery")
    add_bullet(" – administrators sign in through a dedicated admin login portal (`/admin`).", "Administrator Access")

    add_p("Non-Functional Requirements", bold_prefix="• ")
    add_bullet(" – passwords stored only as salted bcrypt hashes; plaintext passwords never logged.", "Security")
    add_bullet(" – authentication completes within 300ms.", "Latency Target")
    add_bullet(" – 6-digit OTP codes expire in 5 minutes and are invalidated upon consumption.", "Recovery Safety")

    add_p("API Design", bold_prefix="• ")
    auth_api_hdr = ["Method", "Endpoint", "Purpose / Contract"]
    auth_api_rows = [
        ["POST", "/api/auth/register", "Body: {name, email, password, phone, address}. Returns user & JWT."],
        ["POST", "/api/auth/login", "Body: {email, password}. Returns signed JWT; 403 for suspended."],
        ["POST", "/api/auth/send-otp", "Body: {email}. Dispatches 6-digit code via Nodemailer."],
        ["POST", "/api/auth/reset-password", "Body: {email, otp, newPassword}. Sets new bcrypt hash."],
        ["GET", "/api/auth/me", "Header: Bearer <token>. Returns current user profile."]
    ]
    add_table_data(auth_api_hdr, auth_api_rows)

    add_p("DB Design", bold_prefix="• ")
    auth_db_hdr = ["Collection", "Keys & Indexes", "Key Fields"]
    auth_db_rows = [
        ["users", "_id, unique id, unique email", "name, email, password (hash), phone, address, role, status"],
        ["admins", "_id, unique id, unique email", "name, email, password, role"]
    ]
    add_table_data(auth_db_hdr, auth_db_rows)

    add_figure_placeholder("Fig 8.3", "Login screen with quick demo accounts")
    add_figure_placeholder("Fig 8.4", "Registration screen with validation")
    add_figure_placeholder("Fig 8.5", "Forgot-password dialog (OTP email dispatch)")
    add_figure_placeholder("Fig 8.6", "JWT Inspector & Biometric simulated sign-in")
    add_figure_placeholder("Fig 8.7", "Administrator separate portal login")

    # -------------------------------------------------------------------------
    # 8.4 MODULE 2: OCCASION CATALOG & DISCOVERY
    # -------------------------------------------------------------------------
    add_custom_heading("8.4 OCCASION CATALOG & DISCOVERY", 2, space_before=16, space_after=8)
    add_p("Purpose & Scope", bold_prefix="• ")
    add_p(
        "Enables shoppers to discover gifts through a comprehensive catalog of 34 cultural, celebratory, and career occasions. "
        "Contains 1,020 verified physical products with zero loose food or drink items, rich specifications, and multi-angle imagery."
    )
    
    add_p("Functional Requirements", bold_prefix="• ")
    add_bullet(" – organized across 4 groups (Celebrations, Festivals, Career, Lifestyle).", "34 Occasions Dropdown")
    add_bullet(" – filter by occasion, price tier, color hex, rating, and department.", "Multi-Faceted Filters")
    add_bullet(" – live client-side search across product titles, brand names, and occasion tags.", "Real-Time Keyword Search")
    add_bullet(" – displays product gallery, hallmark badge, pricing in INR, warranty, and reviews.", "Product Detail Page")

    add_p("API Design", bold_prefix="• ")
    cat_api_hdr = ["Method", "Endpoint", "Purpose / Contract"]
    cat_api_rows = [
        ["GET", "/api/products", "Lists catalog with query filters (?occasion=diwali&search=lamp)."],
        ["GET", "/api/products/:id", "Returns single product detail, specs, and stock."],
        ["GET", "/api/occasions", "Returns all 34 occasions metadata with icons and banners."]
    ]
    add_table_data(cat_api_hdr, cat_api_rows)

    add_figure_placeholder("Fig 8.8", "Occasion Catalog storefront with 34 categories")
    add_figure_placeholder("Fig 8.9", "Search results for 'lamp' with occasion filter")
    add_figure_placeholder("Fig 8.10", "Searchable Occasion Dropdown component")
    add_figure_placeholder("Fig 8.11", "Catalog faceted filters (Price, Color, Rating)")
    add_figure_placeholder("Fig 8.12", "Product detail page with multi-angle gallery")
    add_figure_placeholder("Fig 8.13", "Wishlist page with saved gift treasures")
    add_figure_placeholder("Fig 8.14", "Occasion category cards overview")
    add_figure_placeholder("Fig 8.15", "Customer homepage with occasion gift shortcuts")

    # -------------------------------------------------------------------------
    # 8.5 MODULE 3: MEMORY CART & SCHEDULED FUTURE DELIVERY
    # -------------------------------------------------------------------------
    add_custom_heading("8.5 MEMORY CART & SCHEDULED FUTURE DELIVERY", 2, space_before=16, space_after=8)
    add_p("Purpose & Scope", bold_prefix="• ")
    add_p(
        "The core innovation of FutureMemory Cart: lets shoppers schedule gift orders for exact future milestone dates. "
        "Automates order triggers, sends reminder alerts before the milestone, and supports recurring annual schedules."
    )
    
    add_p("Functional Requirements", bold_prefix="• ")
    add_bullet(" – pick target delivery date, occasion, recipient contact, and address.", "Future Scheduling Modal")
    add_bullet(" – configure alerts: 1 day, 3 days, or 1 week before milestone.", "Reminder Offset Settings")
    add_bullet(" – auto-repeat milestone booking every year for birthdays and anniversaries.", "Annual Recurring Schedules")
    add_bullet(" – view all scheduled gifts with live countdown timers and edit capabilities.", "Memory Cart Dashboard")

    add_p("API Design", bold_prefix="• ")
    mem_api_hdr = ["Method", "Endpoint", "Purpose / Contract"]
    mem_api_rows = [
        ["POST", "/api/memory-cart", "Body: {productId, targetDeliveryDate, occasion, recipient}. Schedules gift."],
        ["GET", "/api/memory-cart", "Retrieves all active scheduled gifts for authenticated user."],
        ["DELETE", "/api/memory-cart/:id", "Cancels a scheduled milestone booking."]
    ]
    add_table_data(mem_api_hdr, mem_api_rows)

    add_figure_placeholder("Fig 8.16", "Memory Cart Scheduling Modal with Date Picker")
    add_figure_placeholder("Fig 8.17", "Memory Cart Dashboard with Scheduled Milestones")
    add_figure_placeholder("Fig 8.18", "Milestone Countdown Timer and Reminder Settings")
    add_figure_placeholder("Fig 8.19", "Scheduled Gift Details and Recipient Card")
    add_figure_placeholder("Fig 8.20", "Upcoming milestone alert notification preview")

    # -------------------------------------------------------------------------
    # 8.6 MODULE 4: SHOPPING CART, CHECKOUT & SIMULATED PAYMENT
    # -------------------------------------------------------------------------
    add_custom_heading("8.6 SHOPPING CART, CHECKOUT & SIMULATED PAYMENT", 2, space_before=16, space_after=8)
    add_p("Purpose & Scope", bold_prefix="• ")
    add_p(
        "Manages current purchases, shopping cart calculations, coupon discounts, simulated multi-mode checkout, "
        "and digital receipt generation."
    )
    
    add_p("Functional Requirements", bold_prefix="• ")
    add_bullet(" – add/remove items, variant selection, subtotal, 18% GST tax, and shipping calculation.", "Cart Calculations")
    add_bullet(" – simulated UPI QR code, Credit/Debit card, NetBanking, and COD.", "Payment Gateway Modes")
    add_bullet(" – 5-stage order tracking (Confirmed -> Processing -> Shipped -> Out for Delivery -> Delivered).", "Order Lifecycle")
    add_bullet(" – generates instant printable and downloadable payment receipts with transaction IDs.", "Digital Invoice Receipt")

    add_p("API Design", bold_prefix="• ")
    pay_api_hdr = ["Method", "Endpoint", "Purpose / Contract"]
    pay_api_rows = [
        ["POST", "/api/orders", "Body: {items, shippingAddress, paymentMethod}. Creates order."],
        ["GET", "/api/orders", "Retrieves customer order history."],
        ["GET", "/api/orders/:id/receipt", "Returns printable order receipt details."]
    ]
    add_table_data(pay_api_hdr, pay_api_rows)

    add_figure_placeholder("Fig 8.21", "Shopping Cart with quantity and coupon calculation")
    add_figure_placeholder("Fig 8.22", "Checkout screen with UPI QR Code simulation")
    add_figure_placeholder("Fig 8.23", "Order lifecycle tracker (5-stage fulfillment)")
    add_figure_placeholder("Fig 8.24", "Printable payment receipt with transaction reference")

    # -------------------------------------------------------------------------
    # 8.7 MODULE 5: COMMUNICATION, NOTIFICATIONS & MEMORYBOT
    # -------------------------------------------------------------------------
    add_custom_heading("8.7 COMMUNICATION, NOTIFICATIONS & MEMORYBOT", 2, space_before=16, space_after=8)
    add_p("Purpose & Scope", bold_prefix="• ")
    add_p(
        "Keeps members connected and notified across multiple channels: automated WhatsApp Web alerts, Nodemailer transactional "
        "emails, in-app notification toasts, and a bilingual AI shopping assistant called MemoryBot."
    )
    
    add_p("Functional Requirements", bold_prefix="• ")
    add_bullet(" – dispatches milestone reminders and order updates directly to customer WhatsApp.", "WhatsApp Notifications")
    add_bullet(" – delivers HTML receipts and password reset OTPs via Gmail SMTP.", "Nodemailer Emails")
    add_bullet(" – answers gift recommendation queries in English and Tamil with budget chips.", "Bilingual MemoryBot")
    add_bullet(" – toggle across Emerald Mint, Sunset Amber, Ocean Slate, and Dark Obsidian.", "4 Color Themes")
    add_bullet(" – instant runtime toggle between English, Tamil, and Hindi without reload.", "Multilingual UI")

    add_figure_placeholder("Fig 8.25", "MemoryBot AI Shopping Assistant widget (Bilingual)")
    add_figure_placeholder("Fig 8.26", "In-App Notification Center with unread counter")
    add_figure_placeholder("Fig 8.27", "WhatsApp notification message dispatched to customer phone")
    add_figure_placeholder("Fig 8.28", "Nodemailer OTP verification email received in inbox")
    add_figure_placeholder("Fig 8.29", "Direct Contact Modal (WhatsApp, Phone, Email)")
    add_figure_placeholder("Fig 8.30", "Color theme selector: Emerald Mint, Sunset Amber, Ocean Slate, Dark Obsidian")
    add_figure_placeholder("Fig 8.31", "Storefront switched to Dark Obsidian theme")
    add_figure_placeholder("Fig 8.32", "Interface switched to Tamil (தமிழ்)")
    add_figure_placeholder("Fig 8.33", "Interface switched to Hindi (हिन्दी)")
    add_figure_placeholder("Fig 8.34", "Theme cycle button and language dropdown in Navbar")
    add_figure_placeholder("Fig 8.35", "Live chat support interaction screen")

    # -------------------------------------------------------------------------
    # 8.8 MODULE 6: TRUST, REVIEWS & COMMUNITY
    # -------------------------------------------------------------------------
    add_custom_heading("8.8 TRUST, REVIEWS & COMMUNITY", 2, space_before=16, space_after=8)
    add_p("Purpose & Scope", bold_prefix="• ")
    add_p(
        "Builds buyer confidence through verified customer reviews, transparent ratings, referral badges, and customer profiles."
    )
    
    add_figure_placeholder("Fig 8.36", "Product reviews section with 5-star rating breakdown")
    add_figure_placeholder("Fig 8.37", "Write review dialog with verified purchase check")
    add_figure_placeholder("Fig 8.38", "Customer Profile with member badge and saved addresses")
    add_figure_placeholder("Fig 8.39", "Referral code and gift milestone achievements")

    # -------------------------------------------------------------------------
    # 8.9 MODULE 7: ADMIN CONSOLE & ANALYTICS
    # -------------------------------------------------------------------------
    add_custom_heading("8.9 ADMIN CONSOLE & ANALYTICS", 2, space_before=16, space_after=8)
    add_p("Purpose & Scope", bold_prefix="• ")
    add_p(
        "Centralized administrative console giving store managers control over revenue analytics, user accounts, "
        "catalog CRUD operations, and order lifecycle management."
    )
    
    add_p("Functional Requirements", bold_prefix="• ")
    add_bullet(" – real-time KPIs (Total Revenue, Orders, Products, Active Users).", "Admin Executive Dashboard")
    add_bullet(" – inspect member accounts, suspend or activate credentials.", "User Management")
    add_bullet(" – add/edit/delete gift items, adjust prices, stock, and occasion tags.", "Catalog CRUD Manager")
    add_bullet(" – advance order status along fulfillment pipeline.", "Order Pipeline Control")

    add_figure_placeholder("Fig 8.40", "Admin Dashboard with Revenue KPIs and summary tiles")
    add_figure_placeholder("Fig 8.41", "Admin Manage Users table with status toggle")
    add_figure_placeholder("Fig 8.42", "Admin Manage Products table with stock and pricing controls")
    add_figure_placeholder("Fig 8.43", "Admin Manage Orders table with status update pipeline")
    add_figure_placeholder("Fig 8.44", "Admin Manage Occasions and Category Manager")
    add_figure_placeholder("Fig 8.45", "Interactive REST API Explorer for testing endpoints")
    add_figure_placeholder("Fig 8.46", "Sales analytics charts and monthly trends")
    add_figure_placeholder("Fig 8.47", "System health and server diagnostic monitor")

    doc.add_page_break()

    # =========================================================================
    # PAGE 55: CHAPTER 9 - CONCLUSION & FUTURE WORK
    # =========================================================================
    add_custom_heading("CHAPTER 9\nCONCLUSION", 1, space_before=10, space_after=18, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    add_p(
        "FutureMemory Cart transforms conventional, reactive e-commerce into a thoughtful, proactive memory preservation "
        "and milestone gifting platform. It successfully bridges the gap between human sentiment and automated digital commerce "
        "by combining a curated catalogue of 34 occasions and 1,020 physical gift items with an automated Memory Cart scheduling engine. "
        "By dispatching automated WhatsApp and email notifications prior to significant milestones, the platform ensures that "
        "meaningful relationships are celebrated on time, every time."
    )
    
    add_p(
        "The system follows an engineering-focused layered architecture: React 18 single-page application with Context API on the client, "
        "Express 4 REST micro-services on the server, and persistent document models over MongoDB and SQLite. Security is comprehensively "
        "addressed through bcrypt password hashing, signed JWT authentication, role-based route guards, and an automated 6-digit OTP "
        "email recovery workflow. The interface is universally accessible with instant runtime language switching (English, Tamil, Hindi) "
        "and four curated visual themes."
    )

    add_custom_heading("FUTURE WORK", 2, space_before=20, space_after=10)
    
    add_p(
        "In the future, FutureMemory Cart can be expanded by integrating live production payment gateways (Razorpay, Stripe) with automated "
        "escrow settlements and bank refunds. Machine learning models using collaborative filtering can analyze past milestone celebrations "
        "to proactively recommend personalized gifts based on recipient profiles and social circles. The MemoryBot AI concierge can be "
        "upgraded into an advanced LLM-powered conversational agent capable of voice-activated gift selection. Furthermore, the platform "
        "can be packaged into native mobile applications (iOS and Android) using React Native, and incorporate WebXR augmented reality "
        "previews allowing customers to virtually unbox and inspect gift hampers in 3D before placing scheduled orders."
    )

    # Save to Word Document on Desktop & Workspace
    dest_desktop = os.path.join(os.environ['USERPROFILE'], 'Desktop', 'FutureMemory_Cart_Project_Report.docx')
    dest_local = os.path.join(os.path.dirname(__file__), '..', 'FutureMemory_Cart_Project_Report.docx')
    
    doc.save(dest_desktop)
    doc.save(dest_local)
    
    print(f"Successfully generated Word Report:")
    print(f"Desktop: {dest_desktop}")
    print(f"Local: {dest_local}")

if __name__ == '__main__':
    create_full_report()
