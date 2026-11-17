import Box from "../../components/Box/Box";
import BoxItem from "../../components/BoxItem/BoxItem";
import style from "./Post.module.css"
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
export default function Post(){
    return(
        <Box>
            <div className={style.postHeader}>
                <h1>Заголовок поывфффффффффффффффффффффффффффффффффффффффффффффффффффффффффффффффффффстаa</h1>
                <Box>
                    <a href="/user">
                        <div className={style.authorBox}>
                            <img src="https://placehold.co/1000x100" alt="avatar" className={style.authorAvatar}/>
                            <h2>Имя Автора</h2>
                        </div>
                    </a>
                </Box>
            </div>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut tortor augue, congue eget maximus non, semper a augue. Vestibulum vitae consequat eros, dictum semper nunc. Curabitur blandit enim velit, et fermentum nulla laoreet quis. Vestibulum non magna eu dui facilisis pulvinar. Curabitur ipsum ex, volutpat vel efficitur at, commodo vitae nisl. Donec viverra lectus risus, vel fermentum tortor tristique sed. Ut finibus elit eget imperdiet luctus. Mauris a finibus mi. Nam finibus at mauris vitae ultrices. Nullam sit amet rhoncus eros. Vestibulum interdum dignissim nisi, id viverra massa ullamcorper nec. Nulla non vestibulum urna, nec lobortis massa.

Praesent ac diam mi. Nulla mollis tincidunt augue et efficitur. Morbi in posuere odio. Mauris orci mi, eleifend nec sapien quis, pretium varius tellus. Mauris sit amet luctus ligula. Nam quis congue diam. Etiam pharetra posuere magna ac elementum. Etiam egestas interdum nisi auctor interdum. Nam tincidunt venenatis condimentum. Sed venenatis eleifend dolor id pharetra.

Nullam rhoncus gravida odio. Nunc rutrum elementum porttitor. Proin risus purus, volutpat sed magna eget, sollicitudin tincidunt lorem. Cras a purus vulputate, condimentum dolor a, commodo nibh. Suspendisse libero ante, pretium vitae condimentum vel, bibendum id nisl. Ut porta vulputate elit, eu dictum tortor commodo a. Praesent ac ante id magna porta sollicitudin. Sed ornare turpis at interdum ornare. Nulla porta odio eu orci tristique porttitor. Sed ut tellus elit. Nam cursus quis enim a pulvinar. Vestibulum a lorem euismod, pulvinar eros a, suscipit felis. Aliquam fringilla mi quam, a iaculis mauris fringilla cursus. Quisque facilisis vulputate odio, a pharetra enim posuere et. Ut non congue neque, id condimentum lectus. In sit amet ipsum nec lacus semper pulvinar ultrices a ligula.

Morbi tincidunt ut orci in consequat. Cras sagittis ante at iaculis consectetur. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Vestibulum porta elit velit, sed porta ipsum auctor a. Curabitur id nunc sollicitudin, auctor nibh imperdiet, ultricies magna. Vestibulum posuere interdum nunc, eu fringilla risus venenatis ut. Sed sed massa eget urna iaculis vestibulum. Proin quis risus non quam tempor facilisis at at mauris. Donec semper diam sem, vel pulvinar tortor semper sit amet. Aliquam finibus quam a orci posuere consectetur. Maecenas dictum commodo metus in interdum. Duis porta sollicitudin velit ut egestas. In vel vehicula odio, vitae iaculis lorem. Nunc eros enim, posuere non vestibulum sit amet, consequat quis elit. Etiam gravida nec massa non convallis. Praesent vestibulum laoreet commodo.

Duis aliquam vel massa ac porttitor. Quisque ultricies arcu sed erat tempus, id elementum metus ullamcorper. Aliquam est mi, dignissim quis lorem et, fringilla consequat nisi. Donec ligula enim, volutpat vitae vestibulum ac, consectetur eu dolor. Cras ante nulla, elementum at est at, vulputate sollicitudin diam. Aliquam mauris tellus, maximus quis imperdiet vitae, pretium ultricies ipsum. Curabitur ultricies est arcu, et pulvinar orci vehicula sit amet. Donec non sapien lacus.

Nunc id aliquet nisi, ac scelerisque lacus. Nulla eu felis sit amet mi egestas sagittis vitae eget orci. Duis ullamcorper consectetur sollicitudin. Vivamus ac mi venenatis, fermentum libero sit amet, gravida purus. Nulla eu euismod nisi. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aliquam luctus suscipit mauris, et fringilla magna tempor a. Praesent vitae imperdiet ante. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aenean malesuada augue non erat aliquam vulputate. Nam dictum consectetur dui, a molestie nulla dictum eu. Aliquam aliquet justo sed tincidunt laoreet. Mauris faucibus nisi non risus dictum porttitor. Maecenas lectus neque, euismod at nunc a, dignissim fringilla turpis.

Nulla vitae congue enim. Sed elit justo, porta nec dui tempus, iaculis sollicitudin dolor. Etiam vestibulum arcu mollis mi tempor, a semper turpis consectetur. Sed eget mattis odio, in viverra mauris. Aliquam erat volutpat. Nunc lobortis convallis leo, eget maximus eros euismod ut. Curabitur luctus nulla sit amet sapien fermentum, sit amet efficitur leo dictum. Nam posuere velit diam, et laoreet quam malesuada ullamcorper. Ut feugiat, turpis quis interdum pellentesque, neque lorem sollicitudin tortor, nec venenatis leo nulla non ante. Suspendisse non consectetur nunc. Nam gravida bibendum sem, vel interdum dolor faucibus sit amet.

Cras porttitor eleifend efficitur. Ut quis urna sem. Fusce arcu lectus, consequat in enim at, pellentesque cursus leo. Aliquam pharetra ligula eget diam elementum, at finibus diam ultrices. Quisque et nunc sed turpis ullamcorper lacinia vitae sit amet orci. Proin vitae eros nulla. Duis ac nisi at orci lacinia malesuada. Vestibulum mi nulla, auctor ac quam at, pretium semper turpis. Duis malesuada tempus laoreet. Donec dapibus, elit ut pharetra molestie, dui enim ullamcorper justo, non dictum sem diam vitae orci.

Pellentesque eu orci et urna tincidunt viverra. Aenean est dui, pharetra ut volutpat non, lacinia ut massa. Quisque sagittis, leo id pulvinar gravida, velit mauris porta mi, venenatis feugiat sem ipsum vitae orci. Curabitur nibh ipsum, posuere eget scelerisque at, fringilla nec lacus. Vestibulum sit amet nibh magna. Maecenas convallis pharetra malesuada. Vestibulum in ultricies mauris. Vivamus pellentesque consequat lorem, sit amet rhoncus magna dignissim vel. Duis ac rhoncus quam. Etiam vitae mauris ut enim finibus porttitor non id massa. Integer tempor fermentum nisi, id consectetur tortor cursus nec. Nunc iaculis porttitor velit, ut tristique nibh lacinia quis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec a justo tincidunt, viverra nulla nec, finibus justo. Sed lacinia et est sed sodales. In sodales, lorem a pharetra rutrum, augue ligula tempor quam, id venenatis ligula sem quis urna.

Duis tincidunt lorem varius, congue mauris at, bibendum magna. Ut mollis, nibh eget cursus consequat, arcu felis ullamcorper nisi, id volutpat neque mi nec arcu. Vivamus consequat mi eros, non elementum dolor ultrices ut. Quisque sed mollis erat, vel malesuada lacus. Morbi lacinia vulputate maximus. Aliquam mattis eu ex ac aliquam. Donec feugiat sem a sem eleifend, et convallis ipsum tincidunt. Aliquam ultricies elit felis, eget iaculis diam molestie quis. Nullam a quam eu orci tristique egestas. Phasellus nec commodo ex. Duis eget porttitor odio.</p>        
        <div className={style.postActions}>
            
            <BoxItem>
                Лайк
            </BoxItem>
            <div className={style.commentSection}>
                <div className={style.commentActions}>
                    <Input placeholder="Комментарий..." className={style.commentInput}/>
                    <Button text="Отправить"/>
                </div>       
            </div>
                <BoxItem >
                    <div className={style.comment}>
                        <img src="https://placehold.co/100x100" alt="" className={style.authorAvatar}/>
                        <div className={style.commentText}>
                            <h3>Комментарий 1 пользователь </h3>
                            <h4 className={style.commentDate}>12.12.2000</h4>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut tortor augue, congue eget maximus non, semper a augue. Vestibulum vitae consequat eros, dictum semper nunc. Curabitur blandit enim velit, et fermentum nulla laoreet quis. Vestibulum non magna eu dui facilisis pulvinar. Curabitur ipsum ex, volutpat vel efficitur at, commodo vitae nisl. Donec viverra lectus risus, vel fermentum tortor tristique sed. Ut finibus elit eget imperdiet luctus. Mauris a finibus mi. Nam finibus at mauris vitae ultrices. Nullam sit amet rhoncus eros. Vestibulum interdum dignissim nisi, id viverra massa ullamcorper nec. Nulla non vestibulum urna, nec lobortis massa.

Praesent ac diam mi. Nulla mollis tincidunt augue et efficitur. Morbi in posuere odio. Mauris orci mi, eleifend nec sapien quis, pretium varius tellus. Mauris sit amet luctus ligula. Nam quis congue diam. Etiam pharetra posuere magna ac elementum. Etiam egestas interdum nisi auctor interdum. Nam tincidunt venenatis condimentum. Sed venenatis eleifend dolor id pharetra.

Nullam rhoncus gravida odio. Nunc rutrum elementum porttitor. Proin risus purus, volutpat sed magna eget, sollicitudin tincidunt lorem. Cras a purus vulputate, condimentum dolor a, commodo nibh. Suspendisse libero ante, pretium vitae condimentum vel, bibendum id nisl. Ut porta vulputate elit, eu dictum tortor commodo a. Praesent ac ante id magna porta sollicitudin. Sed ornare turpis at interdum ornare. Nulla porta odio eu orci tristique porttitor. Sed ut tellus elit. Nam cursus quis enim a pulvinar. Vestibulum a lorem euismod, pulvinar eros a, suscipit felis. Aliquam fringilla mi quam, a iaculis mauris fringilla cursus. Quisque facilisis vulputate odio, a pharetra enim posuere et. Ut non congue neque, id condimentum lectus. In sit amet ipsum nec lacus semper pulvinar ultrices a ligula.

Morbi tincidunt ut orci in consequat. Cras sagittis ante at iaculis consectetur. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Vestibulum porta elit velit, sed porta ipsum auctor a. Curabitur id nunc sollicitudin, auctor nibh imperdiet, ultricies magna. Vestibulum posuere interdum nunc, eu fringilla risus venenatis ut. Sed sed massa eget urna iaculis vestibulum. Proin quis risus non quam tempor facilisis at at mauris. Donec semper diam sem, vel pulvinar tortor semper sit amet. Aliquam finibus quam a orci posuere consectetur. Maecenas dictum commodo metus in interdum. Duis porta sollicitudin velit ut egestas. In vel vehicula odio, vitae iaculis lorem. Nunc eros enim, posuere non vestibulum sit amet, consequat quis elit. Etiam gravida nec massa non convallis. Praesent vestibulum laoreet commodo.

Duis aliquam vel massa ac porttitor. Quisque ultricies arcu sed erat tempus, id elementum metus ullamcorper. Aliquam est mi, dignissim quis lorem et, fringilla consequat nisi. Donec ligula enim, volutpat vitae vestibulum ac, consectetur eu dolor. Cras ante nulla, elementum at est at, vulputate sollicitudin diam. Aliquam mauris tellus, maximus quis imperdiet vitae, pretium ultricies ipsum. Curabitur ultricies est arcu, et pulvinar orci vehicula sit amet. Donec non sapien lacus.

Nunc id aliquet nisi, ac scelerisque lacus. Nulla eu felis sit amet mi egestas sagittis vitae eget orci. Duis ullamcorper consectetur sollicitudin. Vivamus ac mi venenatis, fermentum libero sit amet, gravida purus. Nulla eu euismod nisi. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aliquam luctus suscipit mauris, et fringilla magna tempor a. Praesent vitae imperdiet ante. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aenean malesuada augue non erat aliquam vulputate. Nam dictum consectetur dui, a molestie nulla dictum eu. Aliquam aliquet justo sed tincidunt laoreet. Mauris faucibus nisi non risus dictum porttitor. Maecenas lectus neque, euismod at nunc a, dignissim fringilla turpis.

Nulla vitae congue enim. Sed elit justo, porta nec dui tempus, iaculis sollicitudin dolor. Etiam vestibulum arcu mollis mi tempor, a semper turpis consectetur. Sed eget mattis odio, in viverra mauris. Aliquam erat volutpat. Nunc lobortis convallis leo, eget maximus eros euismod ut. Curabitur luctus nulla sit amet sapien fermentum, sit amet efficitur leo dictum. Nam posuere velit diam, et laoreet quam malesuada ullamcorper. Ut feugiat, turpis quis interdum pellentesque, neque lorem sollicitudin tortor, nec venenatis leo nulla non ante. Suspendisse non consectetur nunc. Nam gravida bibendum sem, vel interdum dolor faucibus sit amet.

Cras porttitor eleifend efficitur. Ut quis urna sem. Fusce arcu lectus, consequat in enim at, pellentesque cursus leo. Aliquam pharetra ligula eget diam elementum, at finibus diam ultrices. Quisque et nunc sed turpis ullamcorper lacinia vitae sit amet orci. Proin vitae eros nulla. Duis ac nisi at orci lacinia malesuada. Vestibulum mi nulla, auctor ac quam at, pretium semper turpis. Duis malesuada tempus laoreet. Donec dapibus, elit ut pharetra molestie, dui enim ullamcorper justo, non dictum sem diam vitae orci.

Pellentesque eu orci et urna tincidunt viverra.</p>
                        </div>
                        
                    </div>
                </BoxItem>
            </div>
        </Box>

    );
}