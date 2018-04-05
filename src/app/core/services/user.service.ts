import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireStorage } from 'angularfire2/storage';
import { Observable } from 'rxjs/Observable';
import '../../rxjs-extensions';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app-store';
import { UserActions } from '../../core/store/actions';
import { User } from '../../model';
import * as useractions from '../../user/store/actions';



@Injectable()
export class UserService {

    constructor(private db: AngularFirestore,
        private storage: AngularFireStorage,
        private store: Store<AppState>, private userActions: UserActions) {
    }


    loadUserProfile(user: User): Observable<User> {

        return this.db.doc<any>('/users/' + user.userId).valueChanges()
            .map(u => {
                if (u) {
                    user = { ...u, ...user, }
                }
                return user;
            })
            .mergeMap(u => this.getUserProfileImage(u));
    }

    saveUserProfile(user: User) {
        const dbUser = Object.assign({}, user); // object to be saved
        delete dbUser.authState;
        delete dbUser.profilePictureUrl;
        this.db.doc(`/users/${dbUser.userId}`).set(dbUser).then(ref => {
            // this.store.dispatch(this.userActions.addUserProfileSuccess());
            this.store.dispatch(new useractions.AddUserProfileSuccess());
        });
    }

    getUsers() {
        this.db.collection<any>('/users').valueChanges().subscribe(users => {
            this.generateUserProfiles(users, 0);
        });
    }

    generateUserProfiles(users: User[], index: number) {
        if (index < users.length) {
            this.getUserProfileImage(users[index]).subscribe(user => {
                users[index] = user;
                index++;
                this.generateUserProfiles(users, index);
            });
        } else {
            this.store.dispatch(this.userActions.loadUsersSuccess(users));
        }
    }


    getUserProfileImage(user: User): Observable<User> {
        if (user.profilePicture && user.profilePicture !== '') {
            const filePath = `profile/${user.userId}/avatar/${user.profilePicture}`;
            const ref = this.storage.ref(filePath);
            return ref.getDownloadURL().map(url => {
                user.profilePictureUrl = (url) ? url : '/assets/images/yourimg.png';
                return user;
            });
        } else {
            user.profilePictureUrl = '/assets/images/yourimg.png'
            return Observable.of(user);
        }
    }

    setSubscriptionFlag(userId: string) {
        this.db.doc(`/users/${userId}`).update({ isSubscribed: true });
    }

}
