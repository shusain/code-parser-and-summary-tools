# shusain/DungeonGame

## A java game I'm making for practice. Based around a text adventure concept.

@Data
@NoArgsConstructor
@RequiredArgsConstructor
@AllArgsConstructor
public class Choice  
  - String displayString
  - String actionResponse
  - GameTile placeToGoIfChosen
  - Enemy enemyOnTile


---

public class ConsoleColors  
  - String RESET
  - String BLACK
  - String RED
  - String GREEN
  - String YELLOW
  - String BLUE
  - String PURPLE
  - String CYAN
  - String WHITE
  - String BLACK_BOLD
  - String RED_BOLD
  - String GREEN_BOLD
  - String YELLOW_BOLD
  - String BLUE_BOLD
  - String PURPLE_BOLD
  - String CYAN_BOLD
  - String WHITE_BOLD
  - String BLACK_UNDERLINED
  - String RED_UNDERLINED
  - String GREEN_UNDERLINED
  - String YELLOW_UNDERLINED
  - String BLUE_UNDERLINED
  - String PURPLE_UNDERLINED
  - String CYAN_UNDERLINED
  - String WHITE_UNDERLINED
  - String BLACK_BACKGROUND
  - String RED_BACKGROUND
  - String GREEN_BACKGROUND
  - String YELLOW_BACKGROUND
  - String BLUE_BACKGROUND
  - String PURPLE_BACKGROUND
  - String CYAN_BACKGROUND
  - String WHITE_BACKGROUND
  - String BLACK_BRIGHT
  - String RED_BRIGHT
  - String GREEN_BRIGHT
  - String YELLOW_BRIGHT
  - String BLUE_BRIGHT
  - String PURPLE_BRIGHT
  - String CYAN_BRIGHT
  - String WHITE_BRIGHT
  - String BLACK_BOLD_BRIGHT
  - String RED_BOLD_BRIGHT
  - String GREEN_BOLD_BRIGHT
  - String YELLOW_BOLD_BRIGHT
  - String BLUE_BOLD_BRIGHT
  - String PURPLE_BOLD_BRIGHT
  - String CYAN_BOLD_BRIGHT
  - String WHITE_BOLD_BRIGHT
  - String BLACK_BACKGROUND_BRIGHT
  - String RED_BACKGROUND_BRIGHT
  - String GREEN_BACKGROUND_BRIGHT
  - String YELLOW_BACKGROUND_BRIGHT
  - String BLUE_BACKGROUND_BRIGHT
  - String PURPLE_BACKGROUND_BRIGHT
  - String CYAN_BACKGROUND_BRIGHT
  - String WHITE_BACKGROUND_BRIGHT


---

public class Dungeon  
  - String WHAT_LIKE_TO_DO
  - String LINE_BREAK
  - DungeonInput dungI
  - Player player
  - GameTile corridor
  - GameTile roomOne
  - Choice napChoice
  + void readyPlayerOne()
  + void makePlayer()
  + GameTile makeCorridor()
  + GameTile makeRoomOne()
  + InvestigationElement makeRoomOneCage()
  + InvestigationElement makeRoomOneTable()


---

public class DungeonInput  
  - DungeonInput instance
  - Scanner consoleInput
  + DungeonInput getInstance()
  + int getInt()
  + String getName()
  + String promptForString(String promptText)


---

@Data
@NoArgsConstructor
public class Enemy  
  - int maxEnemyHealth
  - int enemyAttackDamage
  - int health
  - EnemyEnum type
  + void setHealth(int health)
  + void die()


---

public enum EnemyEnum  
  Enum values:
  - Troll
  - Goblin
  - Decomposing_Knight
  - Smelly_Gnoll
  - Succubus


---

public class Game  
  + void main(String[] args)


---

public class GameTile  
  - String entryText
  - String roomName
  - ArrayList<Choice> choices
  - ArrayList<GameTile> nearbyTiles
  - ArrayList<InvestigationElement> roomElements
  - Random r
  + void playerEntersTile(Player player)
  + String toString()
  + String getOptionsList()
  + boolean checkIsOptionValid(int choice)
  + void takeAction(Player player, int choice)


---

@Data
public class InvestigationElement  
  - ArrayList<Enemy> enemies
  - ArrayList<Item> items
  - String elementName
  - boolean hasBeenChecked
  - String alreadyBeenSearchedMsg
  - String searchText
  + ArrayList<Item> investigate(Player player)
  @Override
  + String toString()


---

@Data
@RequiredArgsConstructor
public class Item  
  - String name
  - int attackStrength
  - int shieldingStrength
  - int itemHealth
  - ItemTypeEnum type
  - boolean equipped
  - boolean singleUse


---

public enum ItemTypeEnum  
  Enum values:
  - Weapon
  - Shield
  - Boots
  - Potion


---

public class OptionListItem  


---

@Data
@RequiredArgsConstructor
public class Player  
  - int MAX_PLAYER_ATTACK_DAMAGE
  - DungeonInput dungI
  - String name
  - int health
  - int armor
  - ArrayList<Item> items
  - int amountMonstersKilled
  - int numRoomsExplored
  - GameTile currentTile
  @Override
  + String toString()
  + void stepOnTile(GameTile tile)
  + void investigateAnItem(InvestigationElement anElement)
  + void playerDeath()
  + boolean isAlive()
  + void takeAction(int choice)
  + void fight(ArrayList<Enemy> enemies)
  + boolean printEquippableItems()
  + Item getEquippedWeapon()
  + int getAttackDamage()
  + void equipOrUseItem(Item item)


---

public class DungeonTest  
  - InputStream systemIn
  - PrintStream systemOut
  - ByteArrayInputStream testIn
  - ByteArrayOutputStream testOut
  @BeforeAll
  + void setUpOutput()
  + void provideInput(String data)
  + String getOutput()
  @AfterAll
  + void restoreSystemInputOutput()
  @Test
  + void theDungeonAsksYourNameAndGreetsYou()
