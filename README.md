## Survey App

#### Create and share your surveys!

Application provides web ui to respond and stores survey responses from anonymous users and also ui for creating surveys and reading survey results.

## How it works

### Step 1:

Admin visits the website (if app is run locally then address will be <http://localhost:5000>) and logs In.
For the default admin credentials are:

*  UserName: broodmaster
*  Password: default

After that admin gets redirected to the home page where all surveys are displayed

### Step 2:

Admin adds survey by clicking "Add Survey" button.

There admin adds initial general like survey name and descriotion and also creates a list of questions assigned to the current survey.

Then clicks "Confirm & Continue" button.

### Step 3:

After survey was successfully created admin is redirected to Success page that also contains link to the created survey.

Admin can email this link to any user.

### Step 4:

After user (responder) received and follow a link, they are presented with the page where they can respond to the survey.

### Step 5:

After someone has responded to a survey, admin can see the results of the survey by clicking "View results" on a particular survey from the main page


## Quickstart

To run application in development mode you will need:

### Step 1: Have python3, pip3 and nodejs installed
Now you can skipp all other steps just by running `sh` script `run_dev.sh` in the root of the folder or you can follow along with the manual set up process

### Step 2: Git clone this repository and cd inside of repository folder

### Step 3: Install python dependencies

To install python dependencies, use the command:
```
    pip3 install -r requirements.txt
```

As an optional step it is better to create python virtual environment before running previous command
Create virtual environment by running:
```
    python3 -m venv env
    . env/scripts/activate
```

### Step 4: Install node modules
`cd` into `react-frontend` folder and run:
```
    npm install
```


### Step 5: Create db
In this case for db we use simple sqlite, to initialize it, `cd` into `falsk-backend` directory
and run:
```
    python3 init_db.py
```
This command also creates default admin user for this application - *broodmaster*

### Step 6: Run backend REST API:
Execute command:
```
    python3 app.py
```

### Step 6: Run React frontend app:
`cd` inside into `react-frontend` directory and run:
```
    npm start
```

### Step 7: Go to the webapplication
Naviget to <http://localhost:3000> in your browser


### Step 8: Enter credentials of the default amin:
* Username: broodmaster
* Password: default

### Step 9: Enjoy!

