
import requests
from bs4 import BeautifulSoup
import pandas as pd
from supabase import create_client, Client

# --------------------------
# Cloud Interface 
# Configurations
# DB_URL and DB_KEY should be set according to your Supabase project
# DB should have a table 'Hall_Info' with columns: 'file_name' (text), 'content' (text), primary key on 'file_id'(auto-setting)
# --------------------------

DB_URL = "https://peznwluzwbqmwvxvfxge.supabase.co"
DB_KEY = "sb_secret_v8bs3PN-MtLx5aLPmqYG3w_nQSgdMfb"
def upload_to_cloud(file_name, content, content_type="text/markdown"):
    """
    Interface to upload data to cloud (e.g., Supabase, S3).
    
    Args:
        filename (str): Name of the file/identifier.
        content (str/bytes): The actual content to upload.
        content_type (str): Type of content.
    """
    if file_name.endswith('.pdf'):
        return
    print(f"--> [MOCK UPLOAD] Uploading '{file_name}' ({len(content)} bytes) to cloud...")
    ## Load table from supabase
    db_url = DB_URL
    db_key = DB_KEY

    supabase: Client = create_client(db_url, db_key)
    file_name = file_name.replace('.md', '')
    if not supabase.table('Hall_Info').select('*').eq('file_name', file_name).execute().data:
        res = supabase.table('Hall_Info').insert({'file_name': file_name, 'content': content}).execute()
        print(f"Inserted {file_name}: {res}")

        # Update to supabase
    else:
        res = supabase.table('Hall_Info').update({'content': content}).eq('file_name', file_name).execute()
    print(f"Updated {file_name}: {res}")

# --------------------------
# Helper Functions
# --------------------------

def roman_to_int(roman_numeral):
    roman_numerals = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
    total = 0
    prev_value = 0
    for char in reversed(roman_numeral):
        value = roman_numerals.get(char, 0)
        if value < prev_value:
            total -= value
        else:
            total += value
        prev_value = value
    return total

def int_to_roman(number):
    val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    syms = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"]
    roman_numeral = ''
    i = 0
    while number > 0:
        for _ in range(number // val[i]):
            roman_numeral += syms[i]
            number -= val[i]
        i += 1
    return roman_numeral

# --------------------------
# Crawler & Processing Functions (Refactored)
# --------------------------

def crawl_tbl_border(url):
    """Returns a DataFrame instead of saving to CSV."""
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    table = soup.find('table', class_='tbl-border')
    if not table:
        print(f"No table found for {url}")
        return pd.DataFrame()

    rows = table.find_all('tr')
    data = []
    
    # Extract Data
    for row in rows:
        cols = row.find_all(['td', 'th'])
        cols = [ele.text.strip() for ele in cols]
        data.append(cols)

    # Fill missing values
    for i in range(len(data)):
        for j in range(len(data[i])):
            if data[i][j] == '' or data[i][j] == '—':
                data[i][j] = 'N/A'
    
    # Convert to DataFrame
    if data:
        # Assuming first row is header if distinct, otherwise treat all as data
        # Based on previous logic, simply creating DF is safer
        df = pd.DataFrame(data)
        # Using first row as header usually makes sense for tbl-border, logic adjusted:
        new_header = df.iloc[0] 
        df = df[1:] 
        df.columns = new_header
        return df
    return pd.DataFrame()

def adjust_bottom_inclusion(df):
    """Processes DataFrame directly."""
    if df.empty: return df
    
    # Ensure column names are stripped of whitespace
    df.columns = df.columns.str.strip()

    new_rows = []
    for index, row in df.iterrows():
        ug_hall_val = str(row.get('UG Hall', ''))
        
        if '(Bottom)' in ug_hall_val:
            new_row = row.copy()
            new_row['Mattress Size (cm)'] = ug_hall_val
            # Fill other columns from the previous row
            for col in df.columns:
                if col != 'Mattress Size (cm)':
                    # index-1 might not work if index is not sequential, using last added row is safer logic but adhering to user logic:
                     # Accessing previous row logic requires sequential processing implicitly
                     # Using the values from the *last appended* row in new_rows if available
                     if new_rows:
                         new_row[col] = new_rows[-1][col]
            new_rows.append(new_row)
        else:
            new_rows.append(row)
    
    new_rows_df = pd.DataFrame(new_rows)
    result_rows = []
    
    # Concate "(Top)" and "(Bottom)" to UG Hall column
    for index, row in new_rows_df.iterrows():
        mattress_val = str(row.get('Mattress Size (cm)', ''))
        ug_val = str(row.get('UG Hall', ''))

        if '(Top)' in mattress_val:
            row['UG Hall'] = ug_val + ' ' + '(Top)'
            row['Mattress Size (cm)'] = mattress_val.replace('(Top)', '').strip()
        elif '(Bottom)' in mattress_val:
            row['UG Hall'] = ug_val + ' ' + '(Bottom)'
            row['Mattress Size (cm)'] = mattress_val.replace('(Bottom)', '').strip()
        result_rows.append(row)
    
    return pd.DataFrame(result_rows).fillna('N/A')

def crawl_hall_info_member(url):
    """Returns DataFrame."""
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    table = soup.find('table', class_='profile-image')
    prof_data = [["Name","Position","Tel","Email"]]
    
    if table:
        rows = table.find_all('tr')
        for row in rows:
            cols = row.find_all(['td', 'th'])
            cols = [ele.text.strip() for ele in cols]
            cols = [ele.replace("Tel: ", "").replace("Email: ", "") for ele in cols]
            cols = [ele for ele in cols if ele]
            if cols:
                cols = [ele.split('\n') for ele in cols][0]
                prof_data.append(cols)
    
    tables = soup.find_all('table', class_='gray-line-table team')
    team_data = []
    for table in tables:
        data = []
        caption = table.find('caption')
        position = caption.text.strip() if caption else 'N/A'
        thead = table.find('thead')
        headers = [th.text.strip() for th in thead.find_all('th')]
        rows = table.find_all('tr')
        data.append(["Position"] + headers)
        for row in rows:
            cols = row.find_all('td')
            cols = [ele.text.strip() for ele in cols]
            if cols:
                data.append([position] + cols)
        team_data.append(data)

    if len(prof_data) > 1:
        df = pd.DataFrame(prof_data[1:], columns=prof_data[0])
    else:
        df = pd.DataFrame(columns=prof_data[0])
    
    for t in team_data:
        df_t = pd.DataFrame(t[1:], columns=t[0])
        df = pd.concat([df, df_t], ignore_index=True)
    
    df = df.fillna("N/A")
    df = df.replace("", "N/A")
    return df

def crawl_facilities(url):
    """Returns DataFrame."""
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    start_item_num = 1
    for i in range(1,20):
        item = soup.find('div', class_=f'field__item mtpc-section-item mtpc-section-item--{i}')
        if item:
            question = item.find('div', class_='accordion-question')
            if question:
                start_item_num = i + 1
                break
    
    facilities = []
    columns = []
    item = soup.find('div', class_=f'field__item mtpc-section-item mtpc-section-item--{start_item_num}')
    if item:
        ul = item.find('ul')
        if ul:
            lis = ul.find_all('li')
            for li in lis:
                columns.append(li.text.strip())

    start_item_num += 1
    facilities_num = len(columns)

    for i in range(start_item_num , start_item_num + facilities_num):
        item = soup.find('div', class_=f'field__item mtpc-section-item mtpc-section-item--{i}')
        if item:
            text = item.text.strip()
            text = text.replace("Text Area", "")
            text = text.replace("\n", " ").strip()
            facilities.append(text)

    try:
        facilities_df = pd.DataFrame([facilities], columns=columns)
    except ValueError as e:
        print(f"Error processing facilities {url}: {e}")
        return pd.DataFrame()
        
    return facilities_df

def crawl_key_dates(url):
    """Returns DataFrame."""
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    items = soup.find_all('div', class_='mtpc-2col-item mtpc-2col-item--2')
    data = []
    for item in items:
        table = item.find('table', class_='calendar-details')
        if table:
            rows = table.find_all('tr')
            for row in rows:
                cols = row.find_all(['td', 'th'])
                cols = [ele.text.strip() for ele in cols]
                cols = [ele.replace('\xa0', ' ') for ele in cols]
                data.append(cols)

    return pd.DataFrame(data, columns=["Date", "Event"])

def crawl_admission_methods(url):
    """Returns a dictionary containing text DataFrame and list of downloadable files."""
    base_url = "https://shrl.hkust.edu.hk"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    data = []
    downloaded_files = [] # Store files as {'name': str, 'content': bytes}

    items = soup.find_all('div', class_='mtpc-2col-item mtpc-2col-item--1')
    for item in items:
        paragraphs = item.find_all(['p','table'])
        for p in paragraphs:
            if p.name == 'p':
                text = p.text.strip()
                text = text.replace('\xa0', ' ')
                text = text.replace('\n', ' ').strip()
                data.append([text])
            if p.name == 'table':
                rows = p.find_all('tr')
                for row in rows:
                    cols = row.find_all(['td', 'th'])
                    cols = [ele.text.strip() for ele in cols]
                    cols = [ele.replace('\xa0', ' ') for ele in cols]
                    if cols:
                        data.append(cols)
        
        # Capture downloadable files into memory
        a_tags = item.find_all('a', class_='text-btn', href=True)
        for a in a_tags:
            file_url = a['href']
            if file_url.endswith('.pdf') or file_url.endswith('.docx') or file_url.endswith('.doc'):
                file_name = file_url.split('/')[-1]
                full_file_url = base_url + file_url
                print(f"Downloading to memory: {full_file_url}")
                try:
                    file_response = requests.get(full_file_url)
                    downloaded_files.append({
                        'name': file_name,
                        'content': file_response.content
                    })
                except Exception as e:
                    print(f"Failed to download {full_file_url}: {e}")

    df = pd.DataFrame(data)
    # Delete empty rows
    if not df.empty:
        df = df[df.apply(lambda x: x.str.strip().astype(bool).any(), axis=1)]
    
    return {'text_df': df, 'files': downloaded_files}

# --------------------------
# Integration Functions (Refactored to take Variables)
# --------------------------

def intergrate_data_in_memory(hall_number, room_number_df, charges_dict, facilities_dict, member_dict, is_index = False):
    """
    Integrates data from memory dictionaries/DataFrames.
    """
    # 1. Charges
    # charges_dict structure: {'local_new': df, ...}
    charge_data_md = {}
    hall_roman = int_to_roman(hall_number) if hall_number != 'JCH' else 'JCH'

    for key, df in charges_dict.items():
        if df.empty:
            charge_data_md[key] = "N/A"
            continue
            
        if hall_number != 'JCH':
             # Use string matching carefully
            sel = df.loc[df['UG Hall'] == hall_roman]
        else:
            sel = df.loc[df['UG Hall'] == 'JCH']
        
        charge_data_md[key] = sel.to_markdown(index = is_index) if not sel.empty else "N/A"

    # 2. Facilities & Members & Room Types
    hall_key = f"ughall{hall_number}" if hall_number != 'JCH' else "ughall-jch"
    
    # Facilities
    fac_df = facilities_dict.get(hall_key, pd.DataFrame())
    facility_data = fac_df.to_markdown(index = is_index) if not fac_df.empty else "N/A"
    
    # Members
    mem_df = member_dict.get(hall_key, pd.DataFrame())
    member_data = mem_df.to_markdown(index = is_index) if not mem_df.empty else "N/A"
    
    # Room Types
    if not room_number_df.empty:
        if hall_number != 'JCH':
            sel_room = room_number_df.loc[room_number_df['UG Hall'] == hall_roman]
        else:
            sel_room = room_number_df.loc[room_number_df['UG Hall'] == 'JCH']
        room_type_data = sel_room.to_markdown(index = is_index) if not sel_room.empty else "N/A"
    else:
        room_type_data = "N/A"

    return facility_data, member_data, room_type_data, charge_data_md

def integrate_all_facilities(facilities_dict,is_index=False):
    markdown_str = ""
    for name, df in facilities_dict.items():
        markdown_str += f"## {name}\n{df.to_markdown(index = is_index)}\n\n"
    return markdown_str

def integrate_all_members(member_dict,is_index=False):
    markdown_str = ""
    for name, df in member_dict.items():
        markdown_str += f"## {name}\n{df.to_markdown(index = is_index)}\n\n"
    return markdown_str

# --------------------------
# Main Execution Logic
# --------------------------

def main():
    # Store all data in this dictionary
    DATA_STORE = {
        'charges': {},
        'room_number': pd.DataFrame(),
        'members': {},   # Key: ughallX, Value: DataFrame
        'facilities': {}, # Key: ughallX, Value: DataFrame
        'key_dates': pd.DataFrame(),
        'policies': {}    # Key: policy_title, Value: {'text_df': df, 'files': []}
    }

    # 1. Crawl Hall Charges
    print("Crawling Hall Charges...")
    charges_urls = {
        "local_new": "https://shrl.hkust.edu.hk/apply-for-housing/ug/hall-charges-new-local",
        "non_local_new": "https://shrl.hkust.edu.hk/apply-for-housing/ug/hall-charges-new-non-local",
        "local_continuing": "https://shrl.hkust.edu.hk/apply-for-housing/ug/hall-charges-continuing-local",
        "non_local_continuing": "https://shrl.hkust.edu.hk/apply-for-housing/ug/hall-charges-continuing-non-local"
    }
    
    for key, url in charges_urls.items():
        DATA_STORE['charges'][key] = crawl_tbl_border(url)

    # 2. Crawl Room Numbers
    print("Crawling Room Numbers...")
    room_url = "https://shrl.hkust.edu.hk/apply-for-housing/ug/number-of-hall-places-and-room-types"
    raw_room_df = crawl_tbl_border(room_url)
    
    # Process Room Numbers (Adjust for Bottom/Top)
    if not raw_room_df.empty:
        DATA_STORE['room_number'] = adjust_bottom_inclusion(raw_room_df)

    # 3. & 4. Crawl Members & Facilities
    print("Crawling Members & Facilities...")
    hall_urls = [
        "https://shrl.hkust.edu.hk/residential-halls/ug/ughall1",
        "https://shrl.hkust.edu.hk/residential-halls/ug/ughall2",
        "https://shrl.hkust.edu.hk/residential-halls/ug/ughall3",
        "https://shrl.hkust.edu.hk/residential-halls/ug/ughall4",
        "https://shrl.hkust.edu.hk/residential-halls/ug/ughall5",
        "https://shrl.hkust.edu.hk/residential-halls/ug/ughall6",
        "https://shrl.hkust.edu.hk/residential-halls/ug/ughall7",
        "https://shrl.hkust.edu.hk/residential-halls/ug/ughall8",
        "https://shrl.hkust.edu.hk/residential-halls/ug/ughall9",
        "https://shrl.hkust.edu.hk/residential-halls/ug/ughall-jch"
    ]
    
    for url in hall_urls:
        hall_name = url.split('/')[-1] # e.g., ughall1 or ughall-jch
        DATA_STORE['members'][hall_name] = crawl_hall_info_member(url)
        DATA_STORE['facilities'][hall_name] = crawl_facilities(url)

    # 5. Crawl Key Dates
    print("Crawling Key Dates...")
    DATA_STORE['key_dates'] = crawl_key_dates("https://shrl.hkust.edu.hk/apply-for-housing/ug/new-local-ugs")

    # 6. Crawl Admission Policy
    print("Crawling Admission Policy...")
    policy_urls = [
        "https://shrl.hkust.edu.hk/admission-policy/ug/priority-housing",
        "https://shrl.hkust.edu.hk/admission-policy/ug/hall-point-system-i",
        "https://shrl.hkust.edu.hk/admission-policy/ug/lottery",
        "https://shrl.hkust.edu.hk/admission-policy/ug/waitlist"
    ]

    for url in policy_urls:
        title = url.split('/')[-1]
        DATA_STORE['policies'][title] = crawl_admission_methods(url)

    # -----------------------------------------------------
    # Upload Phase (Compiling and sending to Interface)
    # -----------------------------------------------------
    print("Integrating Data and Uploading to Cloud...")
    halls_list = [1,2,3,4,5,6,7,8,9,'JCH']

    # 1. Upload Individual Hall Infos
    for i in halls_list:
        a, b, c, d = intergrate_data_in_memory(
            i, 
            DATA_STORE['room_number'], 
            DATA_STORE['charges'], 
            DATA_STORE['facilities'], 
            DATA_STORE['members']
        )

        # concate a,b,c,d into a single markdown string
        markdown_string = f"# Hall {i} Info\n\n"
        markdown_string += "## Facilities\n" + a + "\n\n## Membership Details\n" + b + "\n\n## Room Types\n" + c + "\n\n## Charges\n"
        for key in d:
            markdown_string += "### " + key + "\n" + d[key] + "\n\n"
        
        # Upload
        file_name = f'ughall-{i}_info.md'
        upload_to_cloud(file_name, markdown_string)

    # 2. Upload Summary Facilities
    all_facilities_md = integrate_all_facilities(DATA_STORE['facilities'])
    upload_to_cloud('all_facilities_info.md', all_facilities_md)

    # 3. Upload Summary Members
    all_members_md = integrate_all_members(DATA_STORE['members'])
    upload_to_cloud('all_member_info.md', all_members_md)

    # 4. Upload Room Number Summary
    if not DATA_STORE['room_number'].empty:
        room_md = DATA_STORE['room_number'].to_markdown(index=False)
        upload_to_cloud('all_room_number_info.md', room_md)

    # 5. Upload Key Dates
    if not DATA_STORE['key_dates'].empty:
        dates_md = DATA_STORE['key_dates'].to_markdown(index=False) # CSV format is often better for dates, or use to_markdown
        upload_to_cloud('key_dates.md', dates_md)

    # 6. Upload Policies and Policy Files
    for title, policy_data in DATA_STORE['policies'].items():
        # Text Data
        text_df = policy_data['text_df']
        if not text_df.empty:
            upload_to_cloud(f'{title}.md', text_df.to_markdown(index=False))
        
        # Binary Files (PDFs etc) --- 留了變量
        for file_info in policy_data['files']:
            upload_to_cloud(f"policy_files/{file_info['name']}", file_info['content'], content_type="application/pdf")

    print("All tasks completed.")

if __name__ == "__main__":
    main()