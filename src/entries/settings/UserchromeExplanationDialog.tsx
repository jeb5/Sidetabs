import React from "react";
import "./UserchromeExplanationDialog.css";
import Dialog from "./components/Dialog";
import { ReactComponent as DOCUMENT_ICON } from "../../assets/icons/Document.svg";
import LinkButton from "./components/LinkButton";
import WarningLabel from "./components/WarningLabel";

export default function UserchromeExplanationDialog({
  open,
  dismissCallback,
}: {
  open: boolean;
  dismissCallback: () => void;
}) {
  return (
    <Dialog open={open} dismissCallback={dismissCallback}>
      <div className="userchrome-explanation-dialog">
        <div className="userchrome-explanation-header">
          <DOCUMENT_ICON />
          <h2>How to modify your UserChrome.css file</h2>
        </div>
        <div className="userchrome-explanation-content">
          <a
            href="#"
            tabIndex={-1}
            style={{ height: "0", outline: "none", pointerEvents: "none" }}
          ></a>
          {/* The above line means that firefox won't autoscroll to the link at the bottom of this page, as
					it will focus on this link in the background instead. This browser behavior is absolutely unhinged,
					and I can't find anything online about it anywhere, so this hacky solution is the only thing I could
					come up with. */}
          <p>
            Firefox's userChrome.css file can be used to apply custom styles to
            Firefox's user interface. It allows you to modify the appearance of
            all of Firefox's UI, including tabs and sidebar.
            <br />
            <br />
            Each Firefox Profile has its own userChrome.css file which Firefox
            will read from when it launches.
          </p>
          <div className="userchrome-explanation-section">
            <h2>1. Enable Custom User Styles</h2>
            <p>
              To improve startup speeds, Firefox does not load custom
              userChrome.css styles by default.
              <br />
              <br />
              To enable custom user styles:
            </p>
            <ol>
              <li>
                Open a new tab and navigate to <strong>about:config</strong>
              </li>
              <li>Accept the warning</li>
              <li>
                Search for <strong>"userprof"</strong> to find the{" "}
                <strong>
                  toolkit.legacyUserProfileCustomizations.stylesheets
                </strong>{" "}
                preference
              </li>
              <li>
                Click the button to enable this preference. It value should now
                be <strong>true</strong>.
              </li>
            </ol>
          </div>
          <div className="userchrome-explanation-section">
            <h2>2. Find your Profile Folder</h2>
            <p>
              Each Firefox profile has its own associated folder, where Firefox
              stores history, bookmarks, browser extensions, etc. Firefox looks
              for the userChrome.css file in your browser's profile folder.
              <br />
              <br />
              To find your profile folder:
            </p>
            <ol>
              <li>
                Click the the application menu in the top-right corner of
                Firefox, and click <strong>Help</strong> {">"}{" "}
                <strong>More troubleshooting information</strong>, or go
                directly to <strong>about:support</strong>.
              </li>
              <li>
                In the Application Basics section, click the button or navigate
                to the path shown next <strong>"Profile Folder"</strong> to open
                your profile folder.
              </li>
            </ol>
          </div>
          <div className="userchrome-explanation-section">
            <h2>3. Create a userChrome.css file</h2>
            <p>
              Firefox doesn't generate a blank userChrome.css file by default,
              so you'll have to create one yourself.
            </p>
            <ol>
              <li>
                Inside your profile folder, create a new folder and name it{" "}
                <strong>"chrome"</strong>.
              </li>
              <li>
                Inside the <strong>"chrome"</strong> folder, create a new file
                named <strong>"userChrome.css"</strong>. Make sure it has the{" "}
                <strong>.css</strong> extension, not <strong>.txt</strong>.
              </li>
              <li>
                Open userChrome.css in a text or code editor to add your custom
                css. The styles in your userChrome file will be applied when you
                restart the browser.
              </li>
            </ol>
          </div>
          <WarningLabel>
            Unintentional changes to your userChrome.css file may render Firefox
            unusable. You can fix this by deleting your userChrome.css file and
            restarting Firefox if necessary.
          </WarningLabel>
          <div className="bottom-buttons">
            <LinkButton href="https://www.userchrome.org/how-create-userchrome-css.html">
              Learn more
            </LinkButton>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
