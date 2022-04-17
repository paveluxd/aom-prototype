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
    var player, cursors, enemy, fireball, expNode, spike, scene

    //Player stats
    var playerStats = {
        life: 100,
        speed: 200,
        points: 0,
        experiece: 0,
        requiredExp: 5,
        level: 1,
        weapons:{
            fireball: {
                equiped: true,
                direction: 'top', 
                damage: 5,
                castSpeed: 2000,
                projSpeed: 360,
                dpsTimeout: 500, //how frequently projectile deals damage
                fadesOnHit: true, //projectiled destroyed on collision
                lastCastTime: Date.now()
            },
            spike: {
                equiped: false,
                damage: 7,
                castSpeed: 5000,
                projSpeed: 0,
                dpsTimeout: 500, //how frequently projectile deals damage
                fadesOnHit: true, //projectiled destroyed on collision
                lastCastTime: Date.now()
            },
            staff: {
                equiped: true,
                direction: 'left', 
                damage: 10,
                castSpeed: 1500,
                projSpeed: 0,
                dpsTimeout: 500, //how frequently projectile deals damage
                fadesOnHit: false, //projectiled destroyed on collision
                lastCastTime: Date.now()
            },
            arcane: {
                equiped: true,
                direction: 'top', 
                damage: 2,
                castSpeed: 500,
                projSpeed: 360,
                dpsTimeout: 500, //how frequently projectile deals damage
                fadesOnHit: false, //projectiled destroyed on collision
                lastCastTime: Date.now(),
                projectileQuant:1,
            },
        }
    }

    //Enemy stats
    var enemyStats = {
        spawnRate: 2000,
        life: 5,
        lifeScaleFactor: 30, //Enemy will get 1 hp per 10 player points
        speed: 60,
        speedScaleFactor: 0.5, //Enemy will get 2 speed per 1 player point.
        walkDirectionCanged: Date.now(),
        walkDelay: 2000,
    }

    //Rewards
    var rewards = {
        life: {
            description: 'Add Health + 10'
        },
        speed: {
            description: 'Add speed + 1'
        },
        fireballDamage: {
            description: 'Add Fireball damage + 5'
        },
        fireballPenetration: {
            description: 'Fireball Penetrates targets'
        },
        fireballCastSpeed: {
            description: 'Reduce Fireball Cooldown'
        },
        spike: {
            description: "Weapon: Spike"
        },
        staff: {
            description: "Weapon: staff"
        } 
    }

    //Points
    var timeText = document.getElementById('time')
    timeText.innerHTML = "0 point"
    var pointsTimeNow = Date.now()


//PRELOAD
    function preload (){
        //Player
        this.load.image('player', './img/player.png')
        this.load.image('player-hit', './img/player-hit.png')
        this.load.spritesheet('player-walk', './img/player-walk.png', { frameWidth: 52, frameHeight: 68 });
        this.load.spritesheet('player-idle', './img/player-idle.png', { frameWidth: 52, frameHeight: 68 });


        //Enemy
        this.load.image('enemy-1', './img/enemy-1.png')
        this.load.image('enemy-1-hit', './img/enemy-1-hit.png');
        this.load.spritesheet('enemy-walk', './img/enemy-walk.png', { frameWidth: 48, frameHeight: 72 });
        this.load.spritesheet('enemy-hit-walk', './img/enemy-hit-walk.png', { frameWidth: 48, frameHeight: 72 });


    
        //Misc
        this.load.image('map', './img/map.png')
        this.load.image('exp-node', './img/exp-node.png')

        //Projectiles
        this.load.image('fireball', './img/fireball.png')
        this.load.image('spike', './img/spike.png')
        this.load.image('staff', './img/staff.png')
        this.load.image('arcane', './img/arcane.png')
    }

//CREATE
    function create (){
        scene = this.scene
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2; //Variables for screen centre
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2; //Variables for screen centre
        cursors = this.input.keyboard.createCursorKeys() //Keyboard keys

    //MAP
        this.add.image(375, 812, 'map')

    //PLAYER
        player = this.physics.add.sprite(screenCenterX, screenCenterY, 'player')
        player.setCollideWorldBounds(true);

        //Anims
            this.anims.create({
                key: 'player-idle',
                frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 3 }),
                frameRate: 6,
                repeat: -1
            })//Idle
            
            this.anims.create({
                key: 'walk',
                frames: this.anims.generateFrameNumbers('player-walk', { start: 0, end: 1 }),
                frameRate: 4,
                repeat: -1
            })//Walk

        player.anims.play('player-idle', true);


    //ENEMY
        enemy = this.physics.add.group();

        //Anims
            this.anims.create({
                key: 'enemy-walk',
                frames: this.anims.generateFrameNumbers('enemy-walk', { start: 0, end: 5 }),
                frameRate: 8,
                repeat: -1
            })//Walk
            
            this.anims.create({
                key: 'enemy-hit-walk',
                frames: this.anims.generateFrameNumbers('enemy-hit-walk', { start: 0, end: 1 }),
                frameRate: 4,
                repeat: -1
            })//Hit walk
        
        //Spawn enemies
        setInterval(function(){
            var value = rNum(4)

            if(value === 0){
                enemy.create(
                    -80,        //x
                    rNum(1200), //y
                    'enemy-1'
                )
            }
            else if (value === 1){
                enemy.create(
                    720,        //x
                    rNum(120),  //y
                    'enemy-1'
                )
            }
            else if (value === 2) {
                enemy.create(
                    rNum(620),
                    1280, 
                    'enemy-1'
                )
            }
            else {
                enemy.create(
                    rNum(620),
                    -80, 
                    'enemy-1'
                )
            }

            //Add custom properties to calculate dmg
            var lastEnemy = enemy.children.entries[enemy.children.entries.length - 1]

            //Set life
            lastEnemy.customHp = enemyStats.life + Math.round(playerStats.points / enemyStats.lifeScaleFactor)
            
            //Last hit timer
            lastEnemy.lastHitTime = Date.now() //Prevent projectiles from hitting multiple times
            lastEnemy.directionChange = Date.now()
            
            //Run animation
            lastEnemy.anims.play('enemy-walk', true)
        }, enemyStats.spawnRate)


    //DROP EXP
        //Drop exp node sprite
        var expText = document.getElementById('exp')
        expText.innerHTML = playerStats.experiece

        //Shows Required EXP
        var nextLevelText = document.getElementById('nextlvl')
        nextLevelText.innerHTML = "Next Level at : " + playerStats.requiredExp

        // Shows Player Level
        var lvlText = document.getElementById('level')
        lvlText.innerHTML = "Level :" + playerStats.level

        expNode = this.physics.add.group()
        this.physics.add.overlap(player, expNode, collectExp, null, this);
        function collectExp (player, expNode){
            playerStats.experiece += 1
            expText.innerHTML = playerStats.experiece
            expNode.destroy()

            // Checks if playerEXP meets Required EXP for level UP
            if(playerStats.experiece == playerStats.requiredExp)
            {
                playerStats.requiredExp += Math.round(playerStats.requiredExp * 0.5)
                playerStats.level++

                nextLevelText.innerHTML = "Next level at: " +playerStats.requiredExp
                lvlText.innerHTML = "Level: " + playerStats.level

                //Decide what rewards to add
                var rewardKeys = Object.keys(rewards)
                for(i=0; i < 3; i++){
                    var rewardType = rNum(rewardKeys.length)
                    var reward = rewards[rewardKeys[rewardType]]
                    console.log(rewards[rewardKeys[rewardType]])

                    var button = document.getElementById('button' + (1 + i))
                    button.innerHTML = reward.description
                    button.setAttribute('data-type', rewardKeys[rewardType])
                }

                scene.pause();// Pauses game
                hide(); // pops up Modal
            }
        }


    //WEAPONS
        //Group cretion
        fireball = this.physics.add.group()
        spike = this.physics.add.group()
        staff = this.physics.add.group()
        arcane = this.physics.add.group()
        
    //COLLIDERS
        this.physics.add.overlap(player, enemy, dmgPlayer, null, this)  //Player vs enemy
        this.physics.add.overlap(fireball, enemy, dmgEnemy, null, this) //Fireball vs enemy
        this.physics.add.overlap(spike, enemy, dmgEnemy, null, this) //Spike vs enemy
        this.physics.add.overlap(staff, enemy, dmgEnemy, null, this) //Staff vs enemy
        this.physics.add.overlap(arcane, enemy, dmgEnemy, null, this) //Staff vs enemy
        this.physics.add.collider(enemy, enemy) //Enemy vs Enemy
    }
    
//UPDATE
    function update (){
        
        //Player movement wihth keyboard
        if (cursors.left.isDown) {
            player.setVelocityX(-Math.abs(playerStats.speed))
            player.anims.play('walk', true);

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
            player.anims.play('walk', true);

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
            player.anims.play('walk', true);

            if(player.body.velocity.x > 0){
                player.setVelocityX(player.body.velocity.x - 5)
            }
            else if (player.body.velocity.x < 0) {
                player.setVelocityX(player.body.velocity.x + 5)
            }
        }
        else if (cursors.down.isDown) {
            player.setVelocityY(playerStats.speed)
            player.anims.play('walk', true);

            if(player.body.velocity.x > 0){
                player.setVelocityX(player.body.velocity.x - 5)
            } 
            else if (player.body.velocity.x < 0) {
                player.setVelocityX(player.body.velocity.x + 5)
            }
        }
        else {
            player.anims.play('player-idle', true);
            player.setVelocityX(0)
            player.setVelocityY(0)
        }

        //Enemy movement
        enemy.children.entries.forEach(function(element){
            if(Date.now() - element.directionChange > enemyStats.walkDelay){
                element.directionChange = Date.now()

                if (rNum(100) < 10) {
                    element.setVelocityY(0)
                    element.setVelocityX(0)
                } 
                else {
                    if (player.x - 25 > element.x || rNum(100) > 90){
                        element.setVelocityX(enemyStats.speed + Math.round(playerStats.points / enemyStats.speedScaleFactor))
                    }
                    else if (player.x + 25 < element.x){
                        element.setVelocityX(-Math.abs(enemyStats.speed) - Math.round(playerStats.points / enemyStats.speedScaleFactor))
                    }
                    
                    else{
                        element.setVelocityX(0)
                    }
        
                    if (player.y - 25 > element.y|| rNum(100) < 10){
                        element.setVelocityY(enemyStats.speed + Math.round(playerStats.points / enemyStats.speedScaleFactor))
                    }
                    else if (player.y + 25 < element.y | rNum(100) < 5){
                        element.setVelocityY(-Math.abs(enemyStats.speed) - Math.round(playerStats.points / enemyStats.speedScaleFactor))
                    }
                    
                    else {
                        element.setVelocityY(0)  
                    }
                }
            }
        })

        //Projectile movement
        staff.children.entries.forEach(function(elem){
            elem.x = player.x - 40
            elem.y = player.y
        })

        //PLAYER POITS CALCULATION
        if(Date.now() - pointsTimeNow > 1000){
            //Update timer
            playerStats.points++
            timeText.innerHTML = playerStats.points + " points"
            pointsTimeNow = Date.now()
        }

        //Weapons
        //Fireball
        if(
            playerStats.weapons.fireball.equiped === true && 
            Date.now() - playerStats.weapons.fireball.lastCastTime > playerStats.weapons.fireball.castSpeed
        ){
            //Update cast time
            playerStats.weapons.fireball.lastCastTime = Date.now()

            //Deletes fireballs at the edge of the screen
            fireball.children.entries.forEach(function (elem){
                if(elem.y < 10){
                    elem.destroy(true)
                }    
            })

            fireball.create(player.x, player.y,'fireball')
            
            fireball.children.entries.forEach(function (elem){  
                elem.angle = 90
                elem.setVelocityY(-Math.abs(playerStats.weapons.fireball.projSpeed))
                elem.setCollideWorldBounds(true)             
            })

        }

        //Spike
        if (
            playerStats.weapons.spike.equiped === true && 
            Date.now() - playerStats.weapons.spike.lastCastTime > playerStats.weapons.spike.castSpeed
        ){
            //Update cast time
            playerStats.weapons.spike.lastCastTime = Date.now()

            //Drop spike
            spike.create(player.x + rNum(80), player.y + rNum(80), 'spike')
        }

        //Staff
        if (
            playerStats.weapons.staff.equiped === true && 
            Date.now() - playerStats.weapons.staff.lastCastTime > playerStats.weapons.staff.castSpeed
        ){

            //Update cast time
            playerStats.weapons.staff.lastCastTime = Date.now()
        
            staff.create(player.x - 40, player.y, 'staff')
            player.setTexture('player-hit')

            setTimeout(function(){
                staff.children.entries.forEach(function(elem){elem.destroy()})
            }, 200)
        }

        //Arcane
        if (
            playerStats.weapons.arcane.equiped === true && 
            Date.now() - playerStats.weapons.arcane.lastCastTime > playerStats.weapons.arcane.castSpeed
        ){
            var projVelocityY = -100
            arcane.clear(true)

            for (i = 0; i < playerStats.weapons.arcane.projectileQuant; i++){
                arcane.create(player.x, player.y, 'arcane')
            }

            arcane.children.entries.forEach(function (elem){                 
                elem.setVelocityX(playerStats.weapons.arcane.projSpeed)
                elem.setVelocityY(projVelocityY)

                projVelocityY += 100
            })                

            playerStats.weapons.arcane.lastCastTime = Date.now()
        }
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

            //Player dead
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
    function dmgEnemy(projectile, enemy){
        var enemyHp = enemy.customHp
        var weaponDmg = playerStats.weapons[projectile.texture.key].damage

        //Enemy dead
        if (Date.now() - enemy.lastHitTime > playerStats.weapons[projectile.texture.key].dpsTimeout){
            //Update hit timer to prevent hit stacking
            enemy.lastHitTime = Date.now()

            //Enemy killed
            if(enemyHp <= weaponDmg){
                //Drop exp node
                expNode.create(enemy.x, enemy.y, 'exp-node')

                //Destory enemy
                enemy.destroy()
            }
            //Enemy hit
            else{
                enemy.customHp -= weaponDmg
                // enemy.setTexture('enemy-1-hit') //changes image when hit
                enemy.anims.play('enemy-hit-walk', true)
            }

            if(playerStats.weapons[projectile.texture.key].fadesOnHit === true){
                projectile.destroy()
            }
        }
    }
    
    //Modal
    function hide(){
        var modal = document.getElementById('modal')
        modal.classList.toggle('hide')
    }

    function rNum(maxValue){
        var value = Math.floor(Math.random() * maxValue)
        return value
    }

    function resumeScene(){
        scene.resume();
    }

    //Decides what reward to give
    function giveReward(button){

        //Reard 1
        if(button.getAttribute('data-type') === 'life'){
            console.log(1)
            //Add life
            playerStats.life += 10
            lifeText.innerHTML = playerStats.life

        }
        // Reward 2
        else if (button.getAttribute('data-type') === 'speed'){
            playerStats.speed += 10
            console.log(playerStats.speed)
        }
        // Reward 2
        else if (button.getAttribute('data-type') === 'fireballDamage'){
            playerStats.weapons.fireball.damage += 5
        }
        else if (button.getAttribute('data-type') === 'fireballCastSpeed'){
            playerStats.weapons.fireball.castSpeed = playerStats.weapons.fireball.castSpeed - 100
            console.log(playerStats.weapons.fireball.castSpeed)
        }
        else if (button.getAttribute('data-type') === 'spike'){
            playerStats.weapons.spike.equiped = true
        }
        else if (button.getAttribute('data-type') === 'fireballPenetration'){
            playerStats.weapons.fireball.fadesOnHit = false
        }
        else if (button.getAttribute('data-type') === 'staff'){
            playerStats.weapons.staff.equiped = true
        }
        else if (button.getAttribute('data-type') === 'staffDamage'){
            playerStats.weapons.staff.damage += 5
        }
        else {
            console.log('No reward found.')
        }

        resumeScene()
    }