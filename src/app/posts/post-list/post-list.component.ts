import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostService } from '../post.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

  posts: Post[] = [];
  private postsSub: Subscription;
  private authStatusSubs: Subscription;
  private loggedUserSubs: Subscription;
  private refreshSubs: Subscription;

  isLoading = false;
  authenticated = false;
  user: {id: string, name: string};

  totalPosts = 0;
  pageSize = 7;
  currentPage = 1;

  moreIsComing = false;

  constructor(private postService: PostService, private auth: AuthService) { }

  ngOnInit() {
    this.isLoading = true;
    this.postService.getPosts(this.pageSize, this.currentPage);
    this.authenticated = this.auth.isAuthenticated();
    if (this.authenticated) {
      this.user = {
        id: this.auth.getAuth().id,
        name: `${this.auth.getAuth().firstName} ${this.auth.getAuth().lastName}`,
      };
    }
    this.postsSub = this.postService.getPostUpdateListener()
      .subscribe(data => {
        this.posts = [...this.posts, ...data.posts];
        this.totalPosts = data.total;
        this.timeDelta();
        this.urlify();
        this.isLoading = false;
        this.moreIsComing = false;
      });
    this.authStatusSubs = this.auth.getAuthStatus()
      .subscribe(isAuthenticated => {
        this.authenticated = isAuthenticated;
      });
    this.loggedUserSubs = this.auth.getLoggedUserListener()
      .subscribe(loggedUser => {
        if (loggedUser.id && loggedUser.firstName && loggedUser.lastName) {
          this.user = {
            id: loggedUser.id,
            name: `${loggedUser.firstName} ${loggedUser.lastName}`,
          };
        }
      });
    this.refreshSubs = this.auth.getRefreshListener()
      .subscribe(() => {
        this.ngOnInit();
      });

    window.onscroll = () => {
      if (this.totalPosts > this.posts.length) {
        if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight) {
          this.moreIsComing = true;
          this.loadMore();
        }
      }
    };
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSubs.unsubscribe();
    this.loggedUserSubs.unsubscribe();
    this.refreshSubs.unsubscribe();
  }

  onDelete(id: string) {
    this.isLoading = true;
    this.postService.deletePost(id).subscribe(response => {
      this.posts = this.posts.filter(post => post.id !== id);
      this.auth.openSnackBar(response.message);
      this.totalPosts --;
      this.isLoading = false;
    }, _error => {
      this.isLoading = false;
    });
  }

  loadMore() {
    this.currentPage++;
    this.postService.getPosts(this.pageSize, this.currentPage);
  }

  imageError(event) {
    event.target.parentElement.classList.remove('post-image');
  }

  toggleImage(post) {
    post.showImage = !post.showImage;
  }

  private timeDelta() {
    const now = new Date();
    this.posts.forEach(post => {
      post.showImage = false;
      const milliDiff = now.getTime() - new Date(post.date).getTime();
      const yearDiff = Math.floor(milliDiff / (1000 * 3600 * 24 * 365));
      if (yearDiff) {
        post.dateDiff = `${yearDiff} year`;
        if (yearDiff > 1) { post.dateDiff += 's'; }
        return;
      }
      const monthDiff = Math.floor(milliDiff / (1000 * 3600 * 24 * 30));
      if (monthDiff) {
        post.dateDiff = `${monthDiff} month`;
        if (monthDiff > 1) { post.dateDiff += 's'; }
        return;
      }
      const weekDiff = Math.floor(milliDiff / (1000 * 3600 * 24 * 7));
      if (weekDiff) {
        post.dateDiff = `${weekDiff} week`;
        if (weekDiff > 1) { post.dateDiff += 's'; }
        return;
      }
      const dayDiff = Math.floor(milliDiff / (1000 * 3600 * 24));
      if (dayDiff) {
        post.dateDiff = `${dayDiff} day`;
        if (dayDiff > 1) { post.dateDiff += 's'; }
        return;
      }
      const hourDiff = Math.floor(milliDiff / (1000 * 3600));
      if (hourDiff) {
        post.dateDiff = `${hourDiff} hour`;
        if (hourDiff > 1) { post.dateDiff += 's'; }
        return;
      }
      const minDiff = Math.floor(milliDiff / (1000 * 60));
      if (minDiff) {
        post.dateDiff = `${minDiff} minute`;
        if (minDiff > 1) { post.dateDiff += 's'; }
        return;
      }
      const secDiff = Math.floor(milliDiff / 1000);
      post.dateDiff = `${secDiff} second`;
      if (secDiff > 1) { post.dateDiff += 's'; }
    });
  }

  private urlify() {
    const urlRegex = /(http(s)?:\/\/)?(www\.)?([\w\-]+\.)?([\w\-]+)(:\d)?(\.[a-z]{2,3})+(\/[\w\-\.]+)*(\?[^\s]+)?/gi;
    const groups = {
      protocol: 1,
      ssl: 2,
      www: 3,
      subdomain: 4,
      domain: 5,
      port: 6,
      tld: 7,
      path: 8,
      params: 9,
    };
    this.posts.forEach(post => {
      if (!post.content || post.content === '') {
        post.showContent = '';
        post.showImage = true;
        return;
      }
      const links = post.content.match(urlRegex);
      post.showContent = post.content;
      if (!links) {
        return;
      } else {
        for (const link of links) {
          const urlComponents = urlRegex.exec(link);
          urlRegex.lastIndex = 0;
          let protocol = '';
          if (!urlComponents[groups.protocol]) {
            protocol = 'http://';
          }
          post.showContent = post.showContent.replace(
            link,
            `<a href=\'${protocol + link}\' target="_blank">${link}</a>`
          );
        }
      }
    });
  }
}
