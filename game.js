    //CONFIGURATION & VARIABLES
    var config = {
        type: Phaser.AUTO,
        width: 640,
        height: 1200,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: true,
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    var game = new Phaser.Game(config)
    var player, cursors, enemy, fireball, expNode, staff

    //Player stats
    var playerStats = {
        life: 100,
        speed: 200,
        points: 0,
        experiece: 0,
        level: 0,
        weapons:{
            fireball: {
                equiped: true,
                direction: 'top', 
                damage: 5,
                castSpeed: 1600,
                projSpeed: 360,
                dpsTimeout: 500, //how frequently projectile deals damage
            },
            staff: {
                equiped: true,
                direction: 'left', 
                damage: 10,
                castSpeed: 1600,
                projSpeed: 0,
                dpsTimeout: 500, //how frequently projectile deals damage
            }
        }
    }

    var enemyGroup = {
        speed: 80
    }

//PRELOAD
    function preload (){
        //Player
        this.load.image('player', './img/player.png')

        //Enemy
        this.load.image('enemy-1', './img/enemy-1.png')
        this.load.image('enemy-1-hit', './img/enemy-1-hit.png');
    
        //Misc
        this.load.image('map', './img/map.png')
        this.load.image('exp-node', './img/exp-node.png')

        //Projectiles
        this.load.image('fireball', './img/fireball.png')
        this.load.image('staff', './img/staff.png')
    }

//CREATE
    function create (){
        //Variables for screen centre
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        //Background image
        this.add.image(375, 812, 'map')

        //Player sprite
        player = this.physics.add.sprite(screenCenterX, screenCenterY, 'player')
        player.setCollideWorldBounds(true);

        //Enemy sprite
        enemy = this.physics.add.group();
        
        setInterval(function()
        {
            let screenX = config.width
            let screenY = config.height
            let unitSize = 80

            if(Math.floor(Math.random()* 10) > 5){
                enemy.create(
                    (Phaser.Math.Between(-80,-600)),
                    (Phaser.Math.Between(1000,600)), //y
                    'enemy-1'
                )
            }
            else {
                enemy.create(
                    (Phaser.Math.Between(600,-80)),
                    (Phaser.Math.Between(-80,-80)), //y
                    'enemy-1'
                )
            }

            //Add custom properties to calculate dmg
            var lastEnemy = enemy.children.entries[enemy.children.entries.length - 1]
            lastEnemy.customHp = Math.floor(Math.random() * 10)
            lastEnemy.customHp = 10
            lastEnemy.lastHitTime = Date.now()
        }, 2000)


        //Drop exp node sprite
        var expText = document.getElementById('exp')
        expText.innerHTML = playerStats.experiece

        expNode = this.physics.add.group()
        this.physics.add.overlap(player, expNode, collectExp, null, this);
        function collectExp (player, expNode){
            playerStats.experiece += 1
            expText.innerHTML = playerStats.experiece
            expNode.destroy()
        }

        //WEAPONS
            //Fireball
            fireball = this.physics.add.group()

            setInterval(function(){
                if(playerStats.weapons.fireball.equiped === true){
                    fireball.create(player.x, player.y,'fireball')
                    //Hit only top
                    if (playerStats.weapons.fireball.direction === 'top'){
                    fireball.children.entries.forEach(function (elem){                 
                        elem.x = player.x
                        elem.y = player.y  
                        elem.angle = 90

                        elem.setVelocityY(-Math.abs(playerStats.weapons.fireball.projSpeed))
                        elem.setVelocityX(0)
                    })
                }
                }
            }, playerStats.weapons.fireball.castSpeed);//repeat attack

            //Staff
            staff = this.physics.add.group()

            setInterval(function(){
                if(playerStats.weapons.staff.equiped === true){
                    //Hit only top
                    if (playerStats.weapons.staff.direction === 'left'){
                        staff.create(player.x, player.y,'staff')
                    }
                }
            }, playerStats.weapons.staff.castSpeed);//repeat attack
        

        //Colliders
        this.physics.add.overlap(player, enemy, dmgPlayer, null, this)  //Player vs enemy
        this.physics.add.overlap(fireball, enemy, dmgEnemy, null, this) //Fireball vs enemy
        this.physics.add.overlap(staff, enemy, dmgEnemy, null, this) //Staff vs enemy

        this.physics.add.collider(enemy, enemy) //Enemy vs Enemy

        //Points calculation function
        var timeText = document.getElementById('time')
        timeText.innerHTML = "0 point"
        setInterval(function(){
            //Update timer
            playerStats.points++
            timeText.innerHTML = playerStats.points + " points"
        }, 1000);
    
        //Keyboard keys
        cursors = this.input.keyboard.createCursorKeys()
    }
    
//UPDATE
    function update (){
        
        //Player movement wihth keyboard
        if (cursors.left.isDown) {
            // player.x -= 3
            player.setVelocityX(-Math.abs(playerStats.speed))

            //Turn drift
            if(player.body.velocity.y > 0){
                player.setVelocityY(player.body.velocity.y - 5)
            }
            else if (player.body.velocity.y < 0) {
                player.setVelocityY(player.body.velocity.y + 5)
            }
        }
        else if (cursors.right.isDown) {
            player.setVelocityX(playerStats.speed)

            //Turn drift
            if(player.body.velocity.y > 0){
                player.setVelocityY(player.body.velocity.y - 5)
            }
            else if (player.body.velocity.y < 0) {
                player.setVelocityY(player.body.velocity.y + 5)
            }
        }
        else if (cursors.up.isDown) {
            player.setVelocityY(-Math.abs(playerStats.speed))

            if(player.body.velocity.x > 0){
                player.setVelocityX(player.body.velocity.x - 5)
            }
            else if (player.body.velocity.x < 0) {
                player.setVelocityX(player.body.velocity.x + 5)
            }
        }
        else if (cursors.down.isDown) {
            player.setVelocityY(playerStats.speed)

            if(player.body.velocity.x > 0){
                player.setVelocityX(player.body.velocity.x - 5)
            } 
            else if (player.body.velocity.x < 0) {
                player.setVelocityX(player.body.velocity.x + 5)
            }
        }
        else {
            player.setVelocityX(0)
            player.setVelocityY(0)
        }

        //Enemy movement
        enemy.children.entries.forEach(function(element){

            if (player.x - 25 > element.x){
                element.setVelocityX(enemyGroup.speed)
            }
            else if (player.x + 25 < element.x){
                element.setVelocityX(-Math.abs(enemyGroup.speed))
            }
            else{
                element.setVelocityX(0)
            }

            if (player.y - 25 > element.y){
                element.setVelocityY(enemyGroup.speed)
            }
            else if (player.y + 25 < element.y){
                element.setVelocityY(-Math.abs(enemyGroup.speed))
            }
            else {
                element.setVelocityY(0)
            }
        })
    }

//GAME LOGIC
    //Player damage
    var lastRun = 0
    var delay = 500

    var lifeText = document.getElementById('life')
    lifeText.innerHTML = playerStats.life //Set life value to obj value

    function dmgPlayer(player, enemy){
        
        //Prevent function from executing more than N times per sec.
        if (lastRun > (Date.now() - delay))
            //Timer
            return;
            lastRun = Date.now();
            
            //Reduce live
            playerStats.life--

            //Check if player is dead
            if(playerStats.life < 1){

                //Reset player object
                playerStats.life = 10
                playerStats.points = 0

                //Restart the game
                this.scene.restart();
            }

            //Update html life label
            lifeText.innerHTML = playerStats.life

            //Change player colour to black on overlap
            player.tint = 0x121212

            //Reset player to white after delay
            setTimeout(function(){ player.tint = 0xffffff; }, 100);
    }

    
    //ENEMY DAMAGE
    function dmgEnemy(weaponObj, enemy){

        var weapon = weaponObj.texture.key
        var enemyHp = enemy.customHp
        var weaponDmg = playerStats.weapons[weapon].damage

        //Enemy dead
        if (Date.now() - enemy.lastHitTime > playerStats.weapons[weapon].dpsTimeout){
            enemy.lastHitTime = Date.now()

            if(enemyHp <= weaponDmg){
                //Drop exp node
                expNode.create(enemy.x, enemy.y, 'exp-node')
                //Destory enemy
                enemy.destroy()
                
            }
            //Enemy hit
            else{
                enemy.customHp -= weaponDmg
                enemy.setTexture('enemy-1-hit') //changes image when hit
                

                if(weapon === 'staff'){
                    staff.children.entries.forEach(function (elem){                     
                        elem.destroy()
                    })
                } 
                else {
                    fireball.children.entries.forEach(function (elem){                     
                        elem.destroy()
                    })
                }
            }
        }
    }
    
    //Modal
    function hide(){
        var modal = document.getElementById('modal')
        modal.classList.toggle('hide')
    }